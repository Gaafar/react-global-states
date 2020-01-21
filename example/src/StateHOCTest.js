import React from 'react';
import {
  updateState,
  createSubPropUpdater,
  useGlobalStates,
} from 'react-global-states';

const updateUserState = createSubPropUpdater('user');

const Component = ({
  parentProp = '',
}) => {
  console.log('StateHOCTest render...');
  const { user: { name } = {} } = useGlobalStates(['user']);
  return <div>
    Hi {name}
    <br/>
    {parentProp}
    <br/>
    <br/>
    <button onClick={() => updateUserState({ name: 'everyone' })}>Greet everyone instead</button>

    <br/>
    <br/>
    <button onClick={() => updateStates({ cart: { items: [] }}) }>Change non-connected prop</button>
  </div>;
};

export default Component;