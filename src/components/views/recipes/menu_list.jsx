import React from 'react';

const MenuItem = (props) => {
    return (
      <div className='ingredient-row'>
        <button className='btn btn-md btn-danger delete-ingredient-button' onClick={(e) => props.handleDeleteMenuItem(e, props.index)}><i className="fa fa-minus" aria-hidden="true"></i></button>
        &nbsp; <a target='_blank' href={props.url}>{props.name}</a>
      </div>
    )
}

class Menu extends React.Component {
  constructor(props) {
    super(props);

  }

  render() {
    const MenuList = [];
      for(let i=0; i<this.props.menu.length; i++) {
        MenuList.push(<MenuItem
          key={i}
          index={i}
          name={this.props.menu[i].name}
          url={this.props.menu[i].url}
          handleDeleteMenuItem={this.props.handleDeleteMenuItem}
        />);
      }

       return (
        <div>
          {MenuList}
        </div>
      )
  }

}


export default Menu;
