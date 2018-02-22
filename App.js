import React from 'react';
import { StyleSheet, Text, View, Image, TextInput, Switch, ToastAndroid, TouchableOpacity} from 'react-native';
import {Permissions, BarCodeScanner, Audio, Constants} from 'expo'
import {Form, Item, Input, Label, Badge, Card, CardItem, Header, Body, Footer, Button, Right, Drawer, List, ListItem} from 'native-base'

export default class App extends React.Component {
  
  constructor(props){
    super(props);
    this.state = {
      url:'http://192.168.43.115:3000/',
      participant: {
        lastName:'',
        firstName:'',
        middleInitial:'',
        controlNumber: '',
        paid: false,
        balance: 0
      },
      prevCN: null,
      isScanned: false,
      torchOn: 'off',
      ready: true,
      manualEntry: false,
      participants:[],
      dispControlNumber:'',
      dispFullName:'',
      queryControlNumber: '',
      tmpPaid: false,
      itemSelected: false
    }
  }

  readHandler = ({type, data}) => {

    if(data!=this.state.prevCN){

      var request = new XMLHttpRequest();
      request.responseType = 'json';
      request.onreadystatechange = async(e) => {
        this.setState({itemSelected:false});
        if (request.readyState !== 4) {
          return;
        }
        if (request.status === 200) {
          console.log('success');
          console.log(request.response);
          console.log(request.responseType);
          if(request.response.length!=0){
            this.setState(prevState=>{
              return({
                prevCN: prevState.participant.controlNumber,
                participant:{
                  fullName: request.response[0].firstName + ' ' + request.response[0].middleInitial + ' ' + request.response[0].lastName,
                  controlNumber: data,
                  paid: request.response[0].paid,
                  balance: 0
                },
                isScanned: true,
                ready: false
              });
            });
          }
          else{
            ToastAndroid.show('Entry not found', ToastAndroid.SHORT);
          }
          const soundObject = new Audio.Sound();
          try {
            await soundObject.loadAsync(require('./res/beep.mp3'));
            await soundObject.playAsync();
          } catch (error) {}
        } else {
          console.warn('error');
        }
      };
      
      request.open('GET', this.state.url+'controlnumbers/'+data);
      request.send();
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

  manualEntryHandler = ()=>{
    if(this.state.manualEntry){
      if(this.state.dispControlNumber != '' && this.state.dispFullName != ''){
        this.setState(prevState=>{return({
          participant:{
            fullName: prevState.dispFullName,
            controlNumber: prevState.dispControlNumber,
            paid: prevState.tmpPaid,
            dispFullName: '',
            dispControlNumber: ''
          }
        })});
        ToastAndroid.show('Manual Entry Success!', ToastAndroid.SHORT);
      }
    }

    this.setState(prevState=>{
      return({
        manualEntry: !prevState.manualEntry
      });
    });
  }

  itemSelected(item){
    console.log(item);
    this.setState({
      dispControlNumber: item.controlNumber,
      dispFullName: item.firstName + ' ' + item.middleInitial + ' ' + item.lastName,
      tmpPaid: item.paid,
      itemSelected: true
    });
  }

  queryParticipant = (text)=>{
    var request = new XMLHttpRequest();
    request.responseType = 'json';
    request.onreadystatechange = (e) => {
      this.setState({itemSelected:false});
      if (request.readyState !== 4) {
        return;
      }
      if (request.status === 200) {
        console.log('success');
        this.setState({participants:request.response})
        console.log(request.responseType);
      } else {
        console.warn('error');
      }
    };
    
    request.open('GET', this.state.url+'names/'+text);
    request.send();
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
                    <Text style={{alignSelf:'center', color:'white',fontSize:16,backgroundColor:'black',padding:10,opacity:.5}}>
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

    formInputView = <View style={styles.form_input_view}>
                      <Form>
                        <Item floatingLabel>
                          <Label>Control #</Label>
                          <Input value={this.state.dispControlNumber}/>
                        </Item>
                        <Item floatingLabel> 
                          <Label>Full Name</Label>
                          {this.state.itemSelected?
                          <Input onChangeText={this.queryParticipant} value={this.state.dispFullName}/>:
                          <Input onChangeText={this.queryParticipant}/>}
                        </Item>
                      </Form>
                      {this.state.participants.length>0?
                      <List
                        onPress={data=>{ToastAndroid.show(data,ToastAndroid.SHORT)}}
                        dataArray={this.state.participants}
                        renderRow={item=>
                          <ListItem>
                            <TouchableOpacity onPress={()=>{this.itemSelected(item);}}><Body>
                              <Text>{item.firstName + ' ' + item.middleInitial + ' ' + item.lastName}</Text>
                              <Text note>{item.controlNumber}</Text>
                            </Body></TouchableOpacity>
                          </ListItem>
                        }>
                      </List>:<Text></Text>}
                    </View>
  
    controlView = <View style={styles.control_view}>
                    {this.state.manualEntry?
                    <Button bordered success onPress={this.manualEntryHandler} style={styles.button_style}><Text>Submit Entry</Text></Button>:
                    <Button bordered  onPress={this.manualEntryHandler} style={styles.button_style}><Text>Manual Entry</Text></Button>}
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
        {this.state.manualEntry?<View style={styles.manual_entry}><Text style={{fontSize:24, color: 'gray',fontFamily: 'Roboto',alignSelf:'center'}}>Manual Entry</Text></View>:cameraView}
        {this.state.manualEntry?formInputView:formView}
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
    backgroundColor: 'white'
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
  form_input_view:{
    flex: 12,
    backgroundColor: 'white',
    paddingHorizontal: 10,
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
  manual_entry:{
    flex:2,
    backgroundColor: 'white',
    padding: 10,
    marginHorizontal:10,
    alignContent: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
    borderRadius:20,
    borderWidth: 2,
    borderColor: 'gray'
  }
});

