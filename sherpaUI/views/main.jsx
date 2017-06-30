import React, { Component } from 'react';
import { SegmentedControl, SegmentedControlItem, Text } from 'react-desktop/macOs';
import Gui from '../components/Gui';
import Publish from '../components/Publish';
import Open from '../components/Open';
import Save from '../components/Save';

const exec = require('child_process').exec
const fs = require('fs-extra');
var data = require('../reactVR/obj.json');
data.loadURL = data.loadURL + Date.now()
const dialog = require('electron').remote.dialog;
const { BrowserWindow } = require('electron').remote



export default class Main extends Component {
  constructor() {
    super();
    this.state = data;

    //bound functions
    this.selectPage = this.selectPage.bind(this)
    this.updateProperties = this.updateProperties.bind(this)
    this.writeToFile = this.writeToFile.bind(this)
    this.setState = this.setState.bind(this)
    this.chooseImage = this.chooseImage.bind(this)
    this.publish = this.publish.bind(this)
    this.openWindow = this.openWindow.bind(this)
    this.updateName = this.updateName.bind(this)
    this.changeScene = this.changeScene.bind(this)
    this.addScene = this.addScene.bind(this)
    this.deleteScene = this.deleteScene.bind(this)
    this.changeTemplate = this.changeTemplate.bind(this)
  }

  addScene(scene) {
    let _this = this;
    new Promise((resolve, reject) => {
      dialog.showOpenDialog({
        filters: [
          {
            name: 'Images + Video',
            extensions: ['jpg', 'png', 'gif', 'mp4']
          }
        ]
      }, function (filePath) {
        if (filePath === undefined) return;
        let imageToLoad = filePath[0].split("/").pop();
        let pathLength = filePath[0].split("/").length;
        let pathMatch = filePath[0].split("/").slice(pathLength - 3, pathLength).join("/");

        if (pathMatch !== 'reactVR/static_assets/' + imageToLoad) {
          console.log('filePath', filePath)
          console.log('saveURI', 'reactVR/static_assets/' + imageToLoad)
          fs.copy(filePath.toString(), 'reactVR/static_assets/' + imageToLoad, function (err) {
            if (err) return console.log(err)
            resolve(imageToLoad)
          })
        } else {
          resolve(imageToLoad)
        }
      })
    }).then((imageURL) => {
      let imageName = imageURL.slice(0, imageURL.length - 4)
      let newState = _this.state;
      newState.scenes[imageName] = Object.assign({}, _this.state.scenes[_this.state.currScene]);
      newState.scenes[imageName].imageURL = imageURL;
      newState.currScene = imageName;
      this.setState(newState)
      this.writeToFile()
    })
  }

  changeScene(scene) {
    let _this = this;
    this.setState({ currScene: scene }, () => {
      fs.writeFile('./reactVR/obj.json', JSON.stringify(_this.state, null, 2), 'utf8', () => {
        console.log('Writing Changes to File')
        _this.setState({
          loadURL: "http://localhost:8081/vr/?" + Date.now()
        })
      });
    })
  }

  deleteScene(scene) {
    let choice = dialog.showMessageBox(
      {
        type: 'question',
        buttons: ['Yes', 'No'],
        title: 'Delete Scene',
        message: 'Are you sure to delete this scene?'
      });

    if (choice === 0) {
      let newState = this.state
      delete newState.scenes[scene];
      newState.currScene = Object.keys(this.state.scenes)[0];
      this.setState(newState);
      this.writeToFile();
    }
  }

  selectPage(page) {
    let _this = this;
    new Promise((resolve, reject) => {
      this.setState({
        currFrame: page
      }, () => { resolve() });
    }).then(() => {
      fs.writeFile('./reactVR/obj.json', JSON.stringify(this.state, null, 2), 'utf8', () => {
        console.log('Writing Changes to File')
      });
    }).then(() => {
      _this.setState({
        loadURL: _this.state.loadURL + Date.now()
      });
    })
  }

  changeTemplate(template) {
    let _this = this;
    let newState = this.state;
    newState.scenes[newState.currScene].frames[newState.currFrame].template = template;
    newState.currTemplate = template;
    this.setState(newState, () => {
      fs.writeFile('./reactVR/obj.json', JSON.stringify(_this.state, null, 2), 'utf8', () => {
        console.log('Writing Changes to File')
        _this.setState({
          loadURL: "http://localhost:8081/vr/?" + Date.now()
        })
      });
    })
  }

  openWindow() {
    let win = new BrowserWindow({ width: 800, height: 600 })
    win.on('closed', () => {
      win = null
    })
    win.loadURL(this.state.loadURL)
  }

  componentDidMount() {
    this.setState({
      loadURL: "http://localhost:8081/vr/?" + Date.now()
    })
  }

  updateName(event) {
    let newState = this.state
    newState[event.target.name] = event.target.value;
    this.setState(newState)
  }

  updateProperties(event) {
    let newState = this.state;
    newState.scenes[this.state.currScene].frames[this.state.currFrame][event.target.name] = event.target.value;
    this.setState(newState);
  }

  writeToFile() {
    fs.writeFile('./reactVR/obj.json', JSON.stringify(this.state, null, 2), 'utf8', () => {
      console.log('Writing Changes to File')
    });
    this.setState({
      loadURL: "http://localhost:8081/vr/?" + Date.now()
    })
  }

  publish() {
    exec("npm run publish")
  }

  chooseImage() {
    let _this = this;
    new Promise((resolve, reject) => {
      dialog.showOpenDialog({
        filters: [
          {
            name: 'Images + Video',
            extensions: ['jpg', 'png', 'gif', 'mp4']
          }
        ]
      }, function (filePath) {
        if (filePath === undefined) return;
        let imageToLoad = filePath[0].split("/").pop();
        let pathLength = filePath[0].split("/").length;
        let pathMatch = filePath[0].split("/").slice(pathLength - 3, pathLength).join("/");

        if (pathMatch !== 'reactVR/static_assets/' + imageToLoad) {
          console.log('filePath', filePath)
          console.log('saveURI', 'reactVR/static_assets/' + imageToLoad)
          fs.copy(filePath.toString(), 'reactVR/static_assets/' + imageToLoad, function (err) {
            if (err) return console.log(err)
            resolve(imageToLoad)
          })
        } else {
          resolve(imageToLoad)
        }
      })
    }).then((imageURL) => {
      let imageName = imageURL.slice(0, imageURL.length - 4)
      let newState = _this.state;
      newState.scenes[_this.state.currScene].imageURL = imageURL;
      console.log(imageName, imageURL)
      newState.scenes[imageName] = newState.scenes[_this.state[_this.state.currScene]];
      delete newState.scenes[_this.state[_this.state.currScene]];
      console.log('new state', newState)
      this.setState(newState)
      this.writeToFile()
    })
  }

  render() {
    return (
      <div id='appcontainer' style={styles.appcontainer} >
        <div id="headspacer" style={styles.header}>
          <Open />
          <Save />
          <div style={styles.logo}>
            <img src="./reactVR/static_assets/sherpa.png" />
          </div>
          <Publish
            publish={this.publish}
          />
        </div>
        <Gui
          data={this.state}
          selectPage={this.selectPage}
          updateProperties={this.updateProperties}
          writeToFile={this.writeToFile}
          loadURL={this.state.loadURL}
          imageURL={this.state.scenes[this.state.currScene].imageURL}
          chooseImage={this.chooseImage}
          openWindow={this.openWindow}
          updateName={this.updateName}
          changeScene={this.changeScene}
          addScene={this.addScene}
          deleteScene={this.deleteScene}
          changeTemplate={this.changeTemplate}
        ></Gui>
        <div id="footer" style={styles.footer}></div>
      </div >
    );
  }
}

let styles = {
  appcontainer: {
    backgroundColor: '#1e2538',
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    height: "8%",
    width: "100%",
    minWidth: '800px',
    minHeight: '50px',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    flex: '[1 0 5%]'
  },
  footer: {
    height: '2%',
    minHeight: '15px',
    flex: '[1 0 10%]',
  },
  logo: {
    minWidth: '145px',
    minHeight: '30px',
    maxWidth: '190px',
    maxHeight: '42px',
    margin: 'auto',
    alignItems: 'center'
  }
}
