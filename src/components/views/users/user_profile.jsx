import React from 'react';

const UserProfile = (props) => (
  <div id='contact'>
    <button onClick={() => props.setView('addrecipe')} className=''><i className="fa fa-plus-square" aria-hidden="true"></i>Submit a Recipe</button>
    <button onClick={() => props.setView('grocerylist')} className=''><i className="fas fa-list-ul"></i>

</button>
  </div>
);

export default UserProfile;
