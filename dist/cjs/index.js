"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.useGlobalStates = exports.createSubPropUpdater = exports.updateStates = exports.getStates = void 0;

var _extends3 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _react = require("react");

// "The" global store
var store = {}; // internal publisher-subscriber system to
// notify containers of store changes.

var pubsub = {
  handlers: [],
  subscribe: function subscribe(handler) {
    // console.log('subscribed');
    if (!this.handlers.includes(handler)) {
      this.handlers.push(handler);
    }
  },
  unsubscribe: function unsubscribe(handler) {
    // console.log('unsubscribed');
    var index = this.handlers.indexOf(handler);

    if (index > -1) {
      this.handlers.splice(index, 1);
    }
  },
  notify: function notify(newStore) {
    this.handlers.forEach(function (handler) {
      return handler(newStore);
    });
  }
};

var getStates = function () {
  return (0, _extends3.default)({}, store);
}; // global state merger. unlike redux, I am not enforcing reducer layer


exports.getStates = getStates;

var updateStates = function (partial) {
  var newStore = (0, _extends3.default)({}, store, {}, partial);
  store = newStore;
  pubsub.notify(newStore);
}; // curry function to partially update a sub property of global store.
// e.g const updateCartState = createSubPropUpdater('cart');
// updateCartState({ items: [], quantity: 0 });
// this is equivalent to
// updateStates({ cart: { ...store.cart, items: [], quantity: 0 } })


exports.updateStates = updateStates;

var createSubPropUpdater = function (propName) {
  return function (partial) {
    var _extends2;

    var newStore = (0, _extends3.default)({}, store, (_extends2 = {}, _extends2[propName] = (0, _extends3.default)({}, store[propName] || {}, {}, partial), _extends2));
    store = newStore;
    pubsub.notify(newStore);
  };
}; // utility


exports.createSubPropUpdater = createSubPropUpdater;
var plainObjectPrototype = Object.getPrototypeOf({});

var twoLevelIsEqual = function (oldState, newState, level) {
  if (level === void 0) {
    level = 1;
  }

  if (oldState === null || newState === null || oldState === undefined || newState === undefined) {
    return oldState === newState;
  }

  var oldStatePrototype = Object.getPrototypeOf(oldState);

  if (level <= 2 && (oldStatePrototype === plainObjectPrototype || Array.isArray(oldState)) && oldStatePrototype === Object.getPrototypeOf(newState)) {
    // check if all props of oldState is in newState
    var isEqual = Object.entries(oldState).every(function (_ref) {
      var key = _ref[0],
          val = _ref[1];
      return twoLevelIsEqual(val, newState[key], level + 1);
    }); // check if all props of newState is in oldState

    isEqual = isEqual && Object.entries(newState).every(function (_ref2) {
      var key = _ref2[0],
          val = _ref2[1];
      return twoLevelIsEqual(oldState[key], val, level + 1);
    }); // if so, they are equal (upto two levels).

    return isEqual;
  }

  if (oldState instanceof Date && newState instanceof Date) {
    return oldState.getTime() === newState.getTime();
  }

  return oldState === newState;
};

var useGlobalStates = function (propsToConnectTo) {
  if (propsToConnectTo === void 0) {
    propsToConnectTo = [];
  }

  var _useState = (0, _react.useState)(propsToConnectTo.reduce(function (acc, propName) {
    if (propName in store) {
      acc[propName] = store[propName];
    }

    return acc;
  }, {})),
      state = _useState[0],
      setState = _useState[1];

  var propNameHash = propsToConnectTo.slice().sort().join('|');
  (0, _react.useEffect)(function () {
    var newStateHandler = function (newStore) {
      var newState = propsToConnectTo.reduce(function (acc, propName) {
        if (propName in newStore) {
          acc[propName] = newStore[propName];
        }

        return acc;
      }, {}); // console.log('current state', state);
      // console.log('new state', newState);
      // console.log('twoLevelIsEqual', twoLevelIsEqual(state, newState));

      if (!twoLevelIsEqual(state, newState)) {
        setState(newState);
      }
    };

    pubsub.subscribe(newStateHandler); // on component unmount, unsubscribe to prevent mem leak

    return function () {
      return pubsub.unsubscribe(newStateHandler);
    }; // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, propNameHash]);
  return state;
};

exports.useGlobalStates = useGlobalStates;