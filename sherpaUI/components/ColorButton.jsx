import React from 'react'
import { ChromePicker } from 'react-color'

class ColorButton extends React.Component {
  constructor() {
    super()
    this.state = {
      displayColorPicker: false,
    };
    this.handleClick = this.handleClick.bind(this)
    this.handleClose = this.handleClose.bind(this)
  }

  handleClick() {
    this.setState({
      displayColorPicker: !this.state.displayColorPicker
    })
  }

  handleClose() {
    this.setState({
      displayColorPicker: false
    })
  }


  render() {

    const popover = {
      position: 'absolute',
      zIndex: '2',
      height: '30px',

    }
    const cover = {
      position: 'fixed'
    }
    return (
      <div>
        <button onClick={ this.handleClick }>Pick Color</button>
        { this.state.displayColorPicker ? <div style={ popover }>
          <div style={ cover } onClick={ this.handleClose }/>
          <ChromePicker />
        </div> : null }
      </div>
    )
  }
}

export default ColorButton
