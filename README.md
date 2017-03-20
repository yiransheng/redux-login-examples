# Login Examples

## Links to Demos

[redux-saga](http://yiransheng.github.io/redux-login-examples/redux-saga-example/index.html)

[redux-loop](http://yiransheng.github.io/redux-login-examples/redux-loop-example/index.html)

## Overview

Implementation for this: [http://stackoverflow.com/questions/42356553/complex-redux-loop-examples](http://stackoverflow.com/questions/42356553/complex-redux-loop-examples)

> More complex workflow (based on an old `redux-saga` example)
> * User presses log-in button, which starts an ajax request to get an auth token
>   * Either User immediately presses log-out button, which should cancel/ignore the pending auth action
>   * OR it should store the auth token when it resolves
> * Should clear the auth token after logout or if login error occurs

The two examples have identical functionality, one built with `redux-loop` one with `redux-saga`. 

## Reducer and Store Organization

Both versions use very similar reducer / store layout. Is it the best and most scalable way to organize data? I don't know. Suffice to say it works for this toy example.

### Main Guiding Principle

To borrow an idea from `Haskell` world: 

> Making illegal states unrepresentable in the type system.

What this means is design types for application data such that a programmer mistake that may produce illegal states at runtime will result in an type error and compile time. Or course with javaScript this is not an option - but still a helpful guideline to follow.

### Staring with Loading Flag

It's obvious we need a flag somewhere in the store alongside user data to tell `React` components whether to show a loading indicator. A very straight-forward way of doing this is:

```
state.loginStatus = {
  loading: true,
  loginError: /* some error or null */,
  user : /* user info */,
  token : /* api token */
}
```

This is quite typical, does it follow our guiding principle though? Not entirely. For example, this should be considered an illegal state:

```
state.loginStatus = {
  loading: true,
  loginError : { message: "Invalid Login Attempt" },
  user : { firstName: "John", lastName: "Doe" },
  token : "1234abcd"
}
```

What does this mean? There's a failed login previously? In that case, who is the user stored here? Is the token valid? Of course, you can write the reducer correctly to make sure this state never materialize, but it would be nice somehow we can mimic type checking to rule out this state even without knowing reducer implementation details.

In typed functional languages, a solution would be using a tagged union:

```
data LoginStatus data err =
    LoggedOut       | 
  , LoggedIn data   |
  , LoginError err  | 
  , Pending
```

Any time a function uses a value of type `LoginStatus`, the compiler will do an exhaustive check to make sure the programmer handles all variants. And a value cannot have login error while simoutenously contains user data.

### Tagged Union using `single-key`

[single-key](https://www.npmjs.com/package/single-key) is a very small library that helps implement run-time tagged union in javaScript. It operates on plain object with exactly one key, and offers a nice patten matching utility. Borrow an example from its npm documentation:

```
let obj = { sypha: 'belnades' };
let value = match(obj, {
  trevor: () => 'vampire killer',
  sypha: () => 'magic',
  grant: () => 'daggers'
});
 
assert(value === 'magic');
 
/* No match found for the object. */
try {
  match(obj, {
    alucard: (val, key) => 'turning into a flippin bat'
  });
} catch (err) {
  assert(err instanceof MatchError);
}
```

I used `single-key` for both `redux-loop` and `redux-saga` implementations. The idea is to tag `loginStatus` state with a key to indicate which variant we currently have in redux store.

### UI as a State Machine

If we ignore data and only focus on the variants of in the `LoginStatus` data model, a finite state machine with transitions outline below represents it perfectly:


```
   +- { type: LOGOUT } ---------+---------{ type: LOGOUT } -------------+ 
   v                            |                                       |
LoggedOut - { type: LOGIN } -> Pending -> { type: LOGIN_SUCCESS } -> LoggedIn
                                |   ^
                                |   | { type: LOGIN }
          { type: LOGIN_ERROR } v   |
                             LoginError
```

State transitions are plain `redux` actions. Represented as a transition table:

| State      | Transition / Action Type |  Next State |
|------------|--------------------------|-------------|
| LoggedOut  | LOGIN                    | Pending     |
| LoginError | LOGIN                    | Pending     |
| Pending    | LOGIN_SUCCESS            | LoggedIn    |
| Pending    | LOGIN_ERROR              | LoginError  |
| Pending    | LOGOUT                   | LoggedOut   |
| LoggedIn   | LOGOUT                   | LoggedOut   |

This state machine forms the basis of my reducer construction. In fact, the main `loginReducer` is constructed by calling a util function `fromStateMachine` with the above transition table repesented as a JSON object keyd by `LoginStatus` tags and action types. The two implementations are nearly identical with two exceptions:

* `redux-loop` version's `Pending` state stores a uniquey `requestId` (`{ Pending: <requestId> }`) to achieve cancelation of login calls (since `Promise`s are not cancelable, the best we can do is ignore async actions if their `requestId` does not match. `redux-saga` has built-in cancelation mechanism, making this step unecessary
* `redux-loop` returns `loop(state, effect)` in some branches of its reducer (duh... the whole point of the library)

### Drawbacks of this Approach

I will quote the critism from stackoverflow:

> the problem with this approach is that it mixes responsibilities. Async workflow + "normal" state. This leads to complex reducers. In real projects, that means you just made it easier to create brittle code.. 

I believe this is very valid. Tagged values adds more safeguard to UI states, but mixes presentational states and business states, therefore apparent tradeoffs here. Personally, for bigger apps I like to store business entities in normalized, flat forms in a seperate key under root redux store, while using tagged-unions for presentational states which refers to entities by id where it's meaningful.

## Contrast `redux-loop` and `redux-saga`

`redux-saga` has much more to offer than `redux-loop` in its csp-like architecture. It typically simplifies reducer states and logic. The cost is some presentational states will get moved inside sagas. Make no mistake, sagas are stateful, for instance, whether a async call is canceled or not. In fact it's even more subtle than that, a saga (or a goroutine in csp world) generator function will "pause" somewhere in its lifecyle, where it is paused at is a critical piece of state that is used to manage async workflows (i.e. blocking vs non-blocking). Usually, this will not a be a big deal - and is well worth it for breaking "redux store as a single source of truth" principle. Sometimes however, it might cause issues. For example, if some action tries to reset store to initial state, you would have to remember to stop all running sagas (breaking a while loop in the generator function). 

`redux-loop` is much simpler and very intuitive to use. I have been using it for about a year now in a production app. There are a number of things that are less ideal:

* Making reducers harder to compose 
* In current version, only way to combine effects is `Effects.batch`, which uses `Promise.all`
  * Typically makes reducers fatter, and requires a lot of intermediate actions and reducers for a single flow
* Being its own enhancer and changing reducer signature interferes with some middlewares (for example, cannot use alongside `redux-thunk` and any library that uses `redux-thunk`)

With that said, for apps without complex async flows, `redux-loop` works really well and its next version's api will fix a lot of issues outline above. In addition, having sync and aync actions logics in one place works really well for simple and typical async flows. For complex ones, well, let's say there are many tricks you can pull off with `Effects.lift` (will be renamed to `map`).

## Other Alternatives

Outside `redux` echosystem, [cerebal](https://github.com/cerebral/cerebral)'s signals are really cool; [Cycle](https://cycle.js.org/)'s reactive approach is much more versatile for complex async flows while keeping its core dead simple.
