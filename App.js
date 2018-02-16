import React from 'react';
import { StyleSheet, Text, View, Image, TextInput, Switch} from 'react-native';
import {Permissions, BarCodeScanner, Audio, Constants} from 'expo'
import {Form, Item, Input, Label, Badge, Card, CardItem, Header, Body, Footer, Button, Right} from 'native-base'

export default class App extends React.Component {
  
  constructor(props){
    super(props);
    this.state = {
      participant: {
        fullName: '',
        controlNumber: '',
        paid: false,
        balance: 0
      },
      prevCN: null,
      isScanned: false,
      torchOn: 'off',
      ready: true
    }
  }

  readHandler = async ({type, data}) => {
    
    if(data!=this.state.prevCN){
      this.setState(prevState=>{
        return({
          prevCN: prevState.participant.controlNumber,
          participant:{
            fullName: 'Joshua Robert B. Castaneda',
            controlNumber: data,
            paid: false,
            balance: 20
          },
          isScanned: true,
          ready: false
        });
      });
      const soundObject = new Audio.Sound();
      try {
        await soundObject.loadAsync(require('./res/beep.mp3'));
        await soundObject.playAsync();
      } catch (error) {}
    }

    setTimeout(()=>{
      this.setState(prevState=>{
        return ({
          ready: true
        });
     })},1000);
     
  };

  torchHandler = ()=>{
    this.setState(prevState=>{
      return({
        torchOn: prevState.torchOn=='on'?'off':'on'
      });
    });
  }

  paidHandler = ()=>{
    this.setState(prevState=>{
      return({
        participant: {
          fullName: prevState.participant.fullName,
          controlNumber: prevState.participant.controlNumber,
          balance: prevState.participant.balance,
          paid: !prevState.participant.paid
        }
      });
    });
  }

  render() {
    headerView = <View style={styles.header_view}>
      <Image 
        source={require('./res/header.png')}
        style={{flex:1, alignSelf:'center'}}
        resizeMode={'contain'}
      />
    </View>

    cameraView = <View style={styles.camera_view}>
                  <BarCodeScanner
                    onBarCodeRead={this.readHandler}
                    torchMode={this.state.torchOn}
                    style={{flex:1, justifyContent:'flex-end', padding:10}}
                    ratio='1:1'>
                    <Text style={{alignSelf:'center', color:'white',fontSize:16}}>
                    {this.state.ready?'Ready to Scan':'Please Wait'}</Text>
                  </BarCodeScanner>
                </View>

    formView = <View style={styles.form_view}>
                  <Card>
                    <CardItem>
                      <Body><Text style={styles.text_style}>{this.state.participant.controlNumber}</Text></Body>
                      
                    </CardItem>
                  </Card>
                  <Card>
                    <CardItem>
                      <Text style={styles.text_style}>{this.state.participant.fullName}</Text>
                    </CardItem>
                  </Card>
                </View>

    controlView = <View style={styles.control_view}>
                    <Button bordered style={styles.button_style}><Text>Manual Entry</Text></Button>
                    {this.state.torchOn=='on'?
                    <Button bordered light onPress={this.torchHandler} style={styles.button_style}><Text>Torch</Text></Button>:
                    <Button bordered dark onPress={this.torchHandler} style={styles.button_style}><Text>Torch</Text></Button>}
                    {this.state.participant.paid?
                    <Button bordered success style={styles.button_style}><Text>Paid (Change: P0.00)</Text></Button>:
                    <Button bordered danger onPress={this.paidHandler} style={styles.button_style}><Text>Not Paid (Set Paid)</Text></Button>}
                  </View>

    footerView = <View style={styles.footer_view}>
                    <Label style={{alignSelf:'center', fontSize: 12}}>Computer Science Research Expo 2018</Label>
                  </View>
    return (
      <View style={styles.main_view}>
        {headerView}
        {cameraView}
        {formView}
        {controlView}
        {footerView}
      </View>
    );

  }
}

const styles = StyleSheet.create({
  main_view: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: 'black'
  },
  header_view: {
    flex: 3,
    backgroundColor: 'white',
    paddingTop: 10
  },
  camera_view:{
    flex: 10,
    backgroundColor: 'yellow',
    borderWidth: 10,
    borderStyle: 'solid',
    borderColor: 'white',
    alignContent: 'stretch'
  },
  form_view:{
    flex: 4,
    backgroundColor: 'white',
    paddingHorizontal: 10,
    flexWrap: 'wrap',
    alignItems: 'stretch'
    
  },
  control_view:{
    flex: 2,
    backgroundColor: 'white',
    padding: 10,
    alignContent: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footer_view:{
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignContent: 'center'    
  },
  button_style:{
    padding: 18,
    marginHorizontal: 2
  },
  text_style:{
    fontSize: 16,
    paddingTop: 1,
    fontFamily: 'Roboto'
  },
  barcode_scanner:{
    
  }
});

