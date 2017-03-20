import reducer from "./ducks/reducer";
import { compose, createStore, applyMiddleware } from "redux";
import createLogger from "redux-logger";
import { install } from "redux-loop";

export default function configureStore() {
  const createStoreWithEnhancers = compose(
    install(),
    applyMiddleware(createLogger())
  )(createStore);

  return createStoreWithEnhancers(reducer);
}
