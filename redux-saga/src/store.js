import { createStore, applyMiddleware } from "redux";
import createSagaMiddleware from "redux-saga";
import createLogger from "redux-logger";

import reducer from "./ducks/reducer";
import loginFlow from "./ducks/saga";

export default function configureStore() {
  const sagaMiddleware = createSagaMiddleware();
  const createStoreWithEnhancers = applyMiddleware(
    sagaMiddleware,
    createLogger()
  )(createStore);

  const store = createStoreWithEnhancers(reducer);
  sagaMiddleware.run(loginFlow);

  return store;
}
