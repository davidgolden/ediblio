import React from 'react';

const MenuItem = (props) => {
    return (
      <div className='ingredient-row'>
        <button className='btn btn-md btn-danger delete-ingredient-button' onClick={(e) => props.handleDeleteMenuItem(e, props.index)}><i className="fa fa-minus" aria-hidden="true"></i></button>
        &nbsp; <a target='_blank' href={props.url}>{props.name}</a>
      </div>
    )
}

const Menu = (props) => {
  const MenuList = [];
    for(let i=0; i<props.menu.length; i++) {
      MenuList.push(<MenuItem
        key={i}
        index={i}
        name={props.menu[i].name}
        url={props.menu[i].url}
        handleDeleteMenuItem={props.handleDeleteMenuItem}
      />);
    }

  return (
    <div>
      {MenuList}
    </div>
  )
}

export default Menu;
