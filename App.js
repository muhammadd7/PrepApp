import React, { useState } from 'react';
import { useEffect } from 'react';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem
} from '@react-navigation/drawer';
import {NavigationContainer} from '@react-navigation/native';
import {
  DefaultTheme as NavigationDefaultTheme,
  DarkTheme as NavigationDarkTheme
} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import { ReactNativeFirebase } from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import {
  Text,
  Paragraph,
  Title,
  Caption,
  Animated,
  View,
  Image,
  TextInput,
  Button,
  TouchableOpacity,
  ViewBase,
  FlatList,
  ActivityIndicator,
  SectionList,
  SafeAreaView,
  TouchableOpacityBase,
  RefreshControl,
  Alert,
  StatusBar,
  StyleSheet,
  ToastAndroid,
  Modal,
  TouchableHighlight,
  json,
} from 'react-native';
import {
  useTheme,
  Avatar,
  Drawer,
  TouchableRipple,
  Switch,
  Provider as PaperProvider,
  DefaultTheme as PaperDefaultTheme,
  DarkTheme as PaperDarkTheme 
} from 'react-native-paper';
import SplashScreen from 'react-native-splash-screen';
import firestore from '@react-native-firebase/firestore';
import RadioForm, { RadioButton, RadioButtonInput, RadioButtonLabel } from 'react-native-simple-radio-button';
import { ScrollView } from 'react-native-gesture-handler';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-community/async-storage';
import { Item } from 'react-native-paper/lib/typescript/components/List/List';

function OlevelSubjects({navigation}) {
  const [loading, setLoading] = useState(true); // Set loading to true on component mount
  const [subjects, setSubjects] = useState([]); // Initial empty array of users
  
  useEffect(() => {
    const subscriber = firestore()
      .collection('Olevel')
      .onSnapshot(querySnapshot => {
        querySnapshot.forEach(documentSnapshot => {
          subjects.push({
            ...documentSnapshot.data(),
            key: documentSnapshot.id,
          });
        });
        setSubjects(subjects);
        setLoading(false);
      });
    
    // Unsubscribe from events when no longer in use
    return () => subscriber();
  }, []);
  if (loading) {
    return <ActivityIndicator />;
  }
  const COLORS = {
    primary: "#252c4a",
    secondary: '#1E90FF',
    accent: '#3498db',

    black: "#171717",
    white: "#FFFFFF",
    background: "#252C4A"
  }

  return (
    <SafeAreaView>
    <ScrollView>
        <TouchableOpacity onPress={() => navigation.openDrawer()} style={{ marginLeft: 10, marginTop: 10 }}>
          <Image style={{
            width: 25,
            height: 25
          }} source={require("./android/app/src/main/assets/images/menu.png")} />
        </TouchableOpacity>
        <View style={{
          alignSelf: 'stretch',
          height: 52,
          flexDirection: 'row', // row
          backgroundColor: COLORS.accent,
          alignItems: 'center',
          justifyContent: 'space-between', // center, space-around
          paddingLeft: 10,
          paddingRight: 10
        }}>

          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image source={require('./android/app/src/main/assets/images/arrow.png')}
              resizeMode="contain"
              style={{
                width: 25,
                height: 25,
              }}></Image>
          </TouchableOpacity>
        </View>
        <Text style={{ fontWeight: 'bold', fontSize: 24, color: 'black', marginBottom:10, marginLeft:10, marginTop:10}}>Subjects</Text>
      <FlatList
        data={subjects}
        renderItem={({item}) => (
          
          <TouchableOpacity
            style={{
              borderWidth: 3,
              borderColor:COLORS.secondary + '40',
              backgroundColor: COLORS.secondary + '20',
              height: 60, borderRadius: 20,
              flexDirection: 'row',
              alignItems: 'center', justifyContent: 'space-between',
              paddingHorizontal: 20,
              marginVertical: 10, marginLeft:10, marginRight:10
              
            }}
            onPress={() => navigation.navigate('OlevelSubjectData', subjects)}>
            <Text style={{ fontWeight: 'bold', fontSize: 16, color: 'black' }}>{item.Subject}</Text>
          </TouchableOpacity>
        )}
      />
      </ScrollView>
    </SafeAreaView>
  );
}

function OlevelSubjectData({navigation, route}){
  const subjectdata = route.params;
  const [loading, setLoading] = useState(true); // Set loading to true on component mount
  const [subjects, setSubjects] = useState([]); // Initial empty array of users
  const [randomQuestions, setRandomQuestion] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentOptionSelected, setCurrentOptionSelected] = useState(null);
  const [correctOption, setCorrectOption] = useState(null);
  const [isOptionsDisabled, setIsOptionsDisabled] = useState(false);
  const [score, setScore] = useState(0);
  const [showNextButton, setShowNextButton] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [progress, setProgress] = useState(new Animated.Value(0));
  const [history, setHistory] = useState([]);

  const COLORS = {
    primary: "#252c4a",
    secondary: '#1E90FF',
    option: '#FFCA3C',
    accent: '#3498db',

    success: '#00C851',
    error: '#ff4444',
    black: "#171717",
    white: "#FFFFFF",
    background: "#252C4A"
  }

  useEffect(() => {
    const subscriber = firestore()
      .collection('Olevel')
      .doc(subjectdata[0].key)
      .collection(subjectdata[0].Subject)
      .onSnapshot(querySnapshot => {
        querySnapshot.forEach(documentSnapshot => {
          subjects.push({
            ...documentSnapshot.data(),
            key: documentSnapshot.id,
          });
        });
        setSubjects(subjects);
        for (let i = 0; i < 10; i++) {
          var rnumber = Math.ceil(Math.random() * subjects.length);
          
          if (rnumber <= 40) {
            randomQuestions.push(subjects[rnumber]);
          }
        }
        setRandomQuestion(randomQuestions);
        setLoading(false);
      });
    // Unsubscribe from events when no longer in use
    return () => subscriber();

  }, []);
  if (loading) {
    return <ActivityIndicator />;
  }

  // const allQuestions = subjects;

  const allQuestions = randomQuestions;

  const progressAnim = progress.interpolate({
    inputRange: [0, allQuestions.length],
    outputRange: ['0%', '100%']
  });

  const validateAnswer = (selectedOption, correct_Option) => {
    setCurrentOptionSelected(selectedOption);
    setCorrectOption(correct_Option);
    setIsOptionsDisabled(true);
    allQuestions[currentQuestionIndex].SelectedOption = selectedOption;
    history.push(allQuestions[currentQuestionIndex]);
    console.log(allQuestions[currentQuestionIndex]);
    console.log(history);
    if (selectedOption === correct_Option) {
      // Set Score
      setScore(score + 1);
      // ToastAndroid.show('Correct!', ToastAndroid.SHORT);
      setShowNextButton(true);
    } else {
      setShowNextButton(true);
      // ToastAndroid.show('Not Correct!', ToastAndroid.SHORT);
    }
    // Show Next Button
  };

  const handleNext = () => {
    if (currentQuestionIndex == allQuestions.length - 1) {
      // Last Question
      // Show Score Modal
      setShowScoreModal(true);
      setHistory(history);
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setCurrentOptionSelected(null);
      setCorrectOption(null);
      setIsOptionsDisabled(false);
      setShowNextButton(false);
    }
    Animated.timing(progress, {
      toValue: currentQuestionIndex + 1,
      duration: 1000,
      useNativeDriver: false
    }).start();
  }

  const restartQuiz = () => {
    setShowScoreModal(false);

    setCurrentQuestionIndex(0);
    setScore(0);

    setCurrentOptionSelected(null);
    setCorrectOption(null);
    setIsOptionsDisabled(false);
    setShowNextButton(false);
    Animated.timing(progress, {
      toValue: 0,
      duration: 1000,
      useNativeDriver: false
    }).start();
  }
  const renderQuestion = () => {
    return (
      <View style={{
        marginVertical: 18
      }}>
        {/* Question Counter */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'flex-end'
        }}>
          <Text style={{ color: COLORS.white, fontSize: 20, opacity: 0.6, marginRight: 2 }}>{currentQuestionIndex + 1}</Text>
          <Text style={{ color: COLORS.white, fontSize: 18, opacity: 0.6 }}>/ {allQuestions.length}</Text>
        </View>

        {/* Question */}
        <View style={{
          borderWidth: 3,
          borderColor: COLORS.secondary,
          backgroundColor: COLORS.secondary,
          borderRadius: 20,
          paddingHorizontal: 20,
          }}>
        <Text style={{
          color: COLORS.white,
          fontSize: 20, fontWeight:'bold'
        }}>Question:</Text>
        <Text style={{
          color: COLORS.white,
          fontSize: 18
        }}>{allQuestions[currentQuestionIndex]?.Question}</Text>
        {
          renderQuestionImage(allQuestions[currentQuestionIndex]?.Question_Image)
        }
        </View>
        {renderImage(allQuestions[currentQuestionIndex]?.Answer_Image)}
      </View>
    )
  }

  const renderOptions = () => {
    return (
      <View>
        <TouchableOpacity
          onPress={() => {
            if (allQuestions[currentQuestionIndex].Choice_A === 'A'){
              validateAnswer(allQuestions[currentQuestionIndex].Choice_A, allQuestions[currentQuestionIndex].Answer);
            } else {
              validateAnswer('A', allQuestions[currentQuestionIndex].Answer);
            }
            
          }
        }
          disabled={isOptionsDisabled}
          key={allQuestions[currentQuestionIndex].Choice_A}
          style = {{borderWidth: 3, 
            borderColor: currentOptionSelected == 'A'
              ? COLORS.option : COLORS.secondary + '40' ,
            backgroundColor: currentOptionSelected == 'A'
              ? COLORS.option + '20': COLORS.secondary + '20',
                            height: 60, borderRadius: 20,
                            flexDirection: 'row',
                            alignItems: 'center', justifyContent: 'space-between',
                            paddingHorizontal: 20,
            marginVertical: 2
          }}>
              <Text style={{ fontSize: 16, color: COLORS.white }}>{allQuestions[currentQuestionIndex].Choice_A}</Text>

            </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            if (allQuestions[currentQuestionIndex].Choice_B === 'B') {
              validateAnswer(
                allQuestions[currentQuestionIndex].Choice_B,
                allQuestions[currentQuestionIndex].Answer,
              );
            } else {
              validateAnswer('B', allQuestions[currentQuestionIndex].Answer);
            }
          }
          }
          disabled={isOptionsDisabled}
          key={allQuestions[currentQuestionIndex].Choice_B}
          style={{
            borderWidth: 3,
            borderColor: currentOptionSelected == 'B'
              ? COLORS.option : COLORS.secondary + '40',
            backgroundColor: currentOptionSelected == 'B'
              ? COLORS.option + '20': COLORS.secondary + '20',
            height: 60, borderRadius: 20,
            flexDirection: 'row',
            alignItems: 'center', justifyContent: 'space-between',
            paddingHorizontal: 20,
            marginVertical: 2
          }}
        >
          <Text style={{ fontSize: 16, color: COLORS.white }}>{allQuestions[currentQuestionIndex].Choice_B}</Text>

        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            if (allQuestions[currentQuestionIndex].Choice_C === 'C') {
              validateAnswer(allQuestions[currentQuestionIndex].Choice_C, allQuestions[currentQuestionIndex].Answer);
            } else {
              validateAnswer('C', allQuestions[currentQuestionIndex].Answer);
            }
          }}
          disabled={isOptionsDisabled}
          key={allQuestions[currentQuestionIndex].Choice_C}
          style={{
            borderWidth: 3,
            borderColor: currentOptionSelected == 'C'
              ? COLORS.option: COLORS.secondary + '40',
            backgroundColor: currentOptionSelected == 'C'
              ? COLORS.option + '20': COLORS.secondary + '20',
            height: 60, borderRadius: 20,
            flexDirection: 'row',
            alignItems: 'center', justifyContent: 'space-between',
            paddingHorizontal: 20,
            marginVertical: 2
          }}
        >
          <Text style={{ fontSize: 16, color: COLORS.white }}>{allQuestions[currentQuestionIndex].Choice_C}</Text>

        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            if (allQuestions[currentQuestionIndex].Choice_D === 'D') {
              validateAnswer(allQuestions[currentQuestionIndex].Choice_D, allQuestions[currentQuestionIndex].Answer);
            } else {
              validateAnswer('D', allQuestions[currentQuestionIndex].Answer);
            }
          }}
          disabled={isOptionsDisabled}
          key={allQuestions[currentQuestionIndex].Choice_D}
          style={{
            borderWidth: 3,
            borderColor: currentOptionSelected == 'D'
              ? COLORS.option: COLORS.secondary + '40',
            backgroundColor: currentOptionSelected == 'D'
              ? COLORS.option + '20': COLORS.secondary + '20',
            height: 60, borderRadius: 20,
            flexDirection: 'row',
            alignItems: 'center', justifyContent: 'space-between',
            paddingHorizontal: 20,
            marginVertical: 2
          }}
        >
          <Text style={{ fontSize: 16, color: COLORS.white }}>{allQuestions[currentQuestionIndex].Choice_D}</Text>

        </TouchableOpacity>
      </View>
    );
  }
  const renderNextButton = () => {
    if (showNextButton) {
      return (
        <TouchableOpacity
          onPress={handleNext}
          style={{
            marginTop: 20, width: '25%', backgroundColor: COLORS.option, padding: 10, borderRadius: 5, alignSelf:'center'
          }}>
          <Text style={{ fontSize: 16, color: COLORS.black, textAlign: 'center' }}>Next</Text>
        </TouchableOpacity>
      )
    } else {
      return null
    }
  }
  const renderProgressBar = () => {
    return (
      <View style={{
        width: '100%',
        height: 20,
        borderRadius: 20,
        backgroundColor: '#00000020',

      }}>
        <Animated.View style={[{
          height: 20,
          borderRadius: 20,
          backgroundColor: COLORS.option
        }, {
          width: progressAnim
        }]}>

        </Animated.View>

      </View>
    )
  }
  

  const renderQuestionImage = questionimage => {

    if (questionimage != '') {
      return (
        <View
          style={{
            width: 300,
            height: 200,
          }}>
          <Image
            source={{ uri: questionimage }}
            style={{
              flex: 1, width: undefined, height: undefined, resizeMode: 'contain',
              marginLeft: 10,
              marginRight: 10,
            }}
          />
        </View>
      );
    } else {
      return null
    }
  }

  const renderImage = answerimage => {
    if (answerimage != '') {
      return (
        <View
          style={{
            width: 300,
            height: 200,
            marginLeft: 10,
            marginRight: 10,
          }}>
          <Image
            source={{ uri: answerimage }}
            style={{
              flex: 1, width: undefined, height: undefined, resizeMode:'contain',
              marginLeft: 10,
              marginRight: 10,
            }}
          />
        </View>

      );
      
    } else{
      return null
    }
  }
  return(
    <SafeAreaView style={{
      flex: 1
    }}>
      <ScrollView >
    
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <View style={{
        flex: 1,
        paddingVertical: 40,
        paddingHorizontal: 16,
        backgroundColor: COLORS.background,
        position: 'relative'
      }}>

        {/* ProgressBar */}
        {renderProgressBar()}

        {/* Question */}
        {renderQuestion()}

        {/* Options */}
        {renderOptions()}

        {/* Next Button */}
        {renderNextButton()}

        {/* Score Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={showScoreModal}
        >
          <View style={{
            flex: 1,
            backgroundColor: COLORS.primary,
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <View style={{
              backgroundColor: COLORS.white,
              width: '90%',
              borderRadius: 20,
              padding: 20,
              alignItems: 'center'
            }}>
              <Text style={{ fontSize: 30, fontWeight: 'bold' }}>{score > (allQuestions.length / 2) ? 'Congratulations!' : 'Oops!'}</Text>

              <View style={{
                flexDirection: 'row',
                justifyContent: 'flex-start',
                alignItems: 'center',
                marginVertical: 20
              }}>
                <Text style={{
                  fontSize: 30,
                  color: score > (allQuestions.length / 2) ? COLORS.success : COLORS.error
                }}>{score}</Text>
                <Text style={{
                  fontSize: 20, color: COLORS.black
                }}>/ {allQuestions.length}</Text>
              </View>
              {/* Retry Quiz button */}
              <TouchableOpacity
                onPress={restartQuiz}
                style={{
                  backgroundColor: COLORS.accent,
                  padding: 20, width: '100%', borderRadius: 20
                }}>
                <Text style={{
                  textAlign: 'center', color: COLORS.white, fontSize: 20
                }}>Retry Quiz</Text>
              </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => navigation.navigate('viewReport', history)}
                  style={{
                    backgroundColor: COLORS.accent,
                    padding: 20, width: '100%', borderRadius: 20, marginTop:10
                  }}>
                  <Text style={{
                    textAlign: 'center', color: COLORS.white, fontSize: 20
                  }}>View Report</Text>
                </TouchableOpacity>
            </View>

          </View>
        </Modal>
         
      </View>
      </ScrollView>
    </SafeAreaView>
   
  );
}

function viewReport ({ navigation, route }) {
  const history = route.params;
  const COLORS = {
    primary: "#252c4a",
    secondary: '#1E90FF',
    accent: '#3498db',

    black: "#171717",
    white: "#FFFFFF",
    background: "#252C4A"
  }
  console.log(history);

  const renderQuestionImage = questionimage => {

    if (questionimage != '') {
      return (
        <View
          style={{
            width: 300,
            height: 200,
          }}>
          <Image
            source={{ uri: questionimage }}
            style={{
              flex: 1, width: undefined, height: undefined, resizeMode: 'contain',
              marginLeft: 10,
              marginRight: 10,
            }}
          />
        </View>
      );
    } else {
      return null
    }
  }

  const renderImage = answerimage => {
    if (answerimage != '') {
      return (
        <View
          style={{
            width: 300,
            height: 200,
            marginLeft: 10,
            marginRight: 10,
          }}>
          <Image
            source={{ uri: answerimage }}
            style={{
              flex: 1, width: undefined, height: undefined, resizeMode: 'contain',
              marginLeft: 10,
              marginRight: 10,
            }}
          />
        </View>

      );

    } else {
      return null
    }
  }

  return (
    <SafeAreaView>
      <ScrollView>
        <View style={{
          alignSelf: 'stretch',
          height: 52,
          flexDirection: 'row', // row
          backgroundColor: COLORS.accent,
          alignItems: 'center',
          justifyContent: 'space-between', // center, space-around
          paddingLeft: 10,
          paddingRight: 10
        }}>

          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image source={require('./android/app/src/main/assets/images/arrow.png')}
              resizeMode="contain"
              style={{
                width: 25,
                height: 25,
              }}></Image>
          </TouchableOpacity>
        </View>
        <Text
          style={{
            fontWeight: 'bold',
            fontSize: 24,
            color: 'black',
            marginBottom: 10,
            marginLeft: 10,
            marginTop: 10,
          }}>
          Report
        </Text>

        <FlatList
          data={history}
          renderItem={({ item }) => (
            <View
              style={{
                borderWidth: 3,
                borderColor: COLORS.secondary + '40',
                backgroundColor: COLORS.secondary + '20',
                height: undefined, borderRadius: 20,
                alignItems: 'center', justifyContent: 'space-between',
                paddingHorizontal: 20,
                marginVertical: 10, marginLeft: 10, marginRight: 10
              }}>
              <View>
                <Text style={{ fontSize: 14, color: 'black' }}>Question: {item.Question}</Text>
                {renderQuestionImage(item.Question_Image)}
                {renderImage(item.Answer_Image)}
                <Text style={{ fontSize: 14, color: 'black', marginTop: 10 }}>Choice A: {item.Choice_A}</Text>
                <Text style={{ fontSize: 14, color: 'black', marginTop: 10 }}>Choice B: {item.Choice_B}</Text>
                <Text style={{ fontSize: 14, color: 'black', marginTop: 10 }}>Choice C: {item.Choice_C}</Text>
                <Text style={{ fontSize: 14, color: 'black', marginTop: 10 }}>Choice D: {item.Choice_D}</Text>
                <Text style={{ fontSize: 14, color: 'black', marginTop:10 }}>Selected Option: {item.SelectedOption}</Text>
                <Text style={{ fontSize: 14, color: 'black', marginTop: 10 }}>Correct Option: {item.Answer}</Text>
              </View>
            </View>
          )}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function AlevelSubjects({ navigation }) {
  const [loading, setLoading] = useState(true); // Set loading to true on component mount
  const [subjects, setSubjects] = useState([]); // Initial empty array of users

  useEffect(() => {
    const subscriber = firestore()
      .collection('Alevel')
      // .doc('F4SaWSaNEWmLbNGkMyRp')
      // .collection('Biology(5090)')
      .onSnapshot(querySnapshot => {
        querySnapshot.forEach(documentSnapshot => {
          subjects.push({
            ...documentSnapshot.data(),
            key: documentSnapshot.id,
          });
        });

        setSubjects(subjects);
        setLoading(false);
      });
    // Unsubscribe from events when no longer in use
    return () => subscriber();
  }, []);
  if (loading) {
    return <ActivityIndicator />;
  }
  const COLORS = {
    primary: "#252c4a",
    secondary: '#1E90FF',
    accent: '#3498db',

    black: "#171717",
    white: "#FFFFFF",
    background: "#252C4A"
  }
  return (
    <SafeAreaView>
    <ScrollView>
        <TouchableOpacity onPress={() => navigation.openDrawer()} style={{ marginLeft: 10, marginTop: 10 }}>
          <Image style={{
            width: 25,
            height: 25
          }} source={require("./android/app/src/main/assets/images/menu.png")} />
        </TouchableOpacity>
        <View style={{
          alignSelf: 'stretch',
          height: 52,
          flexDirection: 'row', // row
          backgroundColor: COLORS.accent,
          alignItems: 'center',
          justifyContent: 'space-between', // center, space-around
          paddingLeft: 10,
          paddingRight: 10
        }}>

          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image source={require('./android/app/src/main/assets/images/arrow.png')}
              resizeMode="contain"
              style={{
                width: 25,
                height: 25,
              }}></Image>
          </TouchableOpacity>
        </View>
        <Text style={{ fontWeight: 'bold', fontSize: 24, color: 'black', marginBottom: 10, marginLeft: 10, marginTop: 10 }}>Subjects</Text>
    
      <FlatList
        data={subjects}
        renderItem={({ item }) => (

          <TouchableOpacity
            style={{
              borderWidth: 3,
              borderColor: COLORS.secondary + '40',
              backgroundColor: COLORS.secondary + '20',
              height: 60, borderRadius: 20,
              flexDirection: 'row',
              alignItems: 'center', justifyContent: 'space-between',
              paddingHorizontal: 20,
              marginVertical: 10, marginLeft: 10, marginRight: 10
            }}
            onPress={() => navigation.navigate('OlevelSubjectData', subjects)}>
            <Text style={{ fontWeight: 'bold', fontSize: 16, color: 'black' }}>{item.Subject}</Text>
          </TouchableOpacity>
        )}
      />
      </ScrollView>
    </SafeAreaView>
  );
}

function IGCSESubjects({ navigation }) {
  const [loading, setLoading] = useState(true); // Set loading to true on component mount
  const [subjects, setSubjects] = useState([]); // Initial empty array of users

  useEffect(() => {
    const subscriber = firestore()
      .collection('IGCSE')
      // .doc('F4SaWSaNEWmLbNGkMyRp')
      // .collection('Biology(5090)')
      .onSnapshot(querySnapshot => {
        querySnapshot.forEach(documentSnapshot => {
          subjects.push({
            ...documentSnapshot.data(),
            key: documentSnapshot.id,
          });
        });
        setSubjects(subjects);
        setLoading(false);
      });
    // Unsubscribe from events when no longer in use
    return () => subscriber();
  }, []);
  if (loading) {
    return <ActivityIndicator />;
  }
  const COLORS = {
    primary: "#252c4a",
    secondary: '#1E90FF',
    accent: '#3498db',

    black: "#171717",
    white: "#FFFFFF",
    background: "#252C4A"
  }
  return (
    <SafeAreaView>
      <ScrollView>
        <TouchableOpacity onPress={() => navigation.openDrawer()} style={{ marginLeft: 10, marginTop: 10 }}>
          <Image style={{
            width: 25,
            height: 25
          }} source={require("./android/app/src/main/assets/images/menu.png")} />
        </TouchableOpacity>
        <View style={{
          alignSelf: 'stretch',
          height: 52,
          flexDirection: 'row', // row
          backgroundColor: COLORS.accent,
          alignItems: 'center',
          justifyContent: 'space-between', // center, space-around
          paddingLeft: 10,
          paddingRight: 10
        }}>

          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image source={require('./android/app/src/main/assets/images/arrow.png')}
              resizeMode="contain"
              style={{
                width: 25,
                height: 25,
              }}></Image>
          </TouchableOpacity>
        </View>
        <Text style={{ fontWeight: 'bold', fontSize: 24, color: 'black', marginBottom: 10, marginLeft: 10, marginTop: 10 }}>Subjects</Text>
      <FlatList
        data={subjects}
        renderItem={({ item }) => (

          <TouchableOpacity
            style={{
              borderWidth: 3,
              borderColor: COLORS.secondary + '40',
              backgroundColor: COLORS.secondary + '20',
              height: 60, borderRadius: 20,
              flexDirection: 'row',
              alignItems: 'center', justifyContent: 'space-between',
              paddingHorizontal: 20,
              marginVertical: 10, marginLeft: 10, marginRight: 10
            }}
            onPress={() => navigation.navigate('OlevelSubjectData', subjects)}>
            <Text style={{ fontWeight: 'bold', fontSize: 16, color: 'black' }}>{item.Subject}</Text>
          </TouchableOpacity>
        )}
      />
      </ScrollView>
    </SafeAreaView>
  );
}

function HomeScreen({navigation}) {
  const COLORS = {
    primary: "#252c4a",
    secondary: '#1E90FF',
    accent: '#3498db',

    black: "#171717",
    white: "#FFFFFF",
    background: "#252C4A"
  }
  return (
    
    <ScrollView>
      
      <TouchableOpacity onPress={() => navigation.openDrawer()} style = {{marginLeft:10, marginTop:10}}>
        <Image style={{
          width: 25,
          height: 25}} source={require("./android/app/src/main/assets/images/menu.png")} />
      </TouchableOpacity>
      <View>
        <View style={{ height: 150, justifyContent:'center'}}>
          <Text style={{fontWeight: 'bold', fontSize: 30, color: 'black', alignSelf: 'center'}}>Welcome to PrepApp</Text>
        </View>
        <View
        style={{flexDirection:'row',alignContent:'center', justifyContent:'center', marginTop: 150}}>
          <TouchableOpacity
            style={{
              width: 130,
              height: 130,
              borderRadius: 100,
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 3,
              borderColor: COLORS.secondary + '40',
              backgroundColor: COLORS.secondary + '20',
              flexDirection: 'row',
              paddingHorizontal: 20,
              marginVertical: 10
            }}
            onPress={() => navigation.navigate('DashboardScreen1')}>
            <Text style={{ fontSize: 16, color: 'black', alignSelf: 'center', fontWeight: 'bold',}}>O'Level</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              width: 130,
              height: 130,
              borderRadius: 100,
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 3,
              borderColor: COLORS.secondary + '40',
              backgroundColor: COLORS.secondary + '20',
              flexDirection: 'row',
              paddingHorizontal: 20,
              marginVertical: 10,
              marginLeft:18,
            }}
            onPress={() => navigation.navigate('DashboardScreen3')}>
            <Text style={{ fontSize: 16, color: 'black', alignSelf: 'center', fontWeight: 'bold', }}>IGCSE</Text>
          </TouchableOpacity>
        </View>
        <View style={{alignItems:'center'}}>
          <TouchableOpacity
            style={{
              width: 130,
              height: 130,
              borderRadius: 100,
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 3,
              borderColor: COLORS.secondary + '40',
              backgroundColor: COLORS.secondary + '20',
              flexDirection: 'row',
              paddingHorizontal: 20,
              marginVertical: 10
            }}
            onPress={() => navigation.navigate('DashboardScreen2')}>
            <Text style={{ fontSize: 16, color: 'black', alignSelf: 'center', fontWeight: 'bold', }}>A'level</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
    
    
  );
}


function SettingsScreen({navigation}) {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1F1E30',
      }}>
      <Text style={{color: 'white'}}>Settings screen</Text>
      <Button
        title="Go to Details"
        onPress={() => navigation.navigate('Details')}
      />
      <Button title="Go to Back" onPress={() => navigation.goBack()} />
    </View>
  );
}

const setLoginLocal = async (loginData) => {
  try {
    const jsonValue = JSON.stringify(loginData);
    console.log(jsonValue);
    await AsyncStorage.setItem('loginData', jsonValue);
  } catch (err) {
    console.log(err);
  }
};

const retrieveData = async () => {
  const value = await AsyncStorage.getItem("loginData");
  console.log(value);
  return JSON.parse(value);
};

const removeData = async () => {
  await AsyncStorage.removeItem("loginData");
};

function Signup({navigation}){
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [retypepassword, setRetypePassword] = useState("");
  const [name, setName] = useState("");


    return (
      <SafeAreaView>

        <TouchableOpacity onPress={() => navigation.openDrawer()} style={{ marginLeft: 10, marginTop: 10 }}>
          <Image style={{
            width: 25,
            height: 25
          }} source={require("./android/app/src/main/assets/images/menu.png")} />
        </TouchableOpacity>
      <View style={styles.container}>
        <Image style={styles.image} source={require("./android/app/src/main/assets/images/PrepAppLogo.png")} />

        <StatusBar style="auto" />
        <View style={styles.inputView}>
          <TextInput
            style={styles.TextInput}
            placeholder="Name."
            placeholderTextColor="#003f5c"
            onChangeText={(name) => setName(name)}
          />
        </View>

        <View style={styles.inputView}>
          <TextInput
            style={styles.TextInput}
            placeholder="Email."
            placeholderTextColor="#003f5c"
            onChangeText={(email) => setEmail(email)}
          />
        </View>

        <View style={styles.inputView}>
          <TextInput
            style={styles.TextInput}
            placeholder="Password."
            placeholderTextColor="#003f5c"
            secureTextEntry={true}
            onChangeText={(password) => setPassword(password)}
          />
        </View>
        <View style={styles.inputView}>
          <TextInput
            style={styles.TextInput}
            placeholder="ReType Password."  
            placeholderTextColor="#003f5c"
            secureTextEntry={true}
            onChangeText={(retypepassword) => setRetypePassword(retypepassword)}
          />
        </View>
        
        <TouchableOpacity style={styles.loginBtn} onPress={() => {
          if (password === retypepassword){
                    try {
                      auth().createUserWithEmailAndPassword(email, password)
                      .then(() => {
                        
                        firestore()
                        .collection('Users')
                        .add({
                            Name: name,
                            Email: email,
                            Score: 0,
                            createdAt: firestore.Timestamp.fromDate(new Date()),
                        })
                        .catch(error => {
                            console.log('Something went wrong with added user to firestore: ', error);
                        });
                      });
                    setLoginLocal({
                      ...json,
                      Name: name,
                      Email: email,
                      Score: 0,
                      })
                      //we need to catch the whole sign up process if it fails too.
                      .catch(error => {
                          console.log('Something went wrong with sign up: ', error);
                      });
                    } catch (e) {
                      console.log(e);
                    }
                    navigation.navigate('UserScreen', )
                  }else {
                    Alert.alert('Password not same');
                  }}
        }>
          <Text style={styles.loginText}>SIGNUP</Text>
        </TouchableOpacity>

      </View>
      </SafeAreaView>
    );
}

function UserScreen({navigation, route}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();
  const [userdata, setUserData] = useState([]);
  // Handle user state changes
  function onAuthStateChanged(user) {
    setUser(user);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    console.log(userdata);
    return subscriber; // unsubscribe on unmount
  }, []);

  if (initializing) return null;

  if (!user) {
      return (
       <SafeAreaView>
          <TouchableOpacity onPress={() => navigation.openDrawer()} style={{ marginLeft: 10, marginTop: 10 }}>
            <Image style={{
              width: 25,
              height: 25
            }} source={require("./android/app/src/main/assets/images/menu.png")} />
          </TouchableOpacity>
      <View style={styles.container}>
      
        <Image style={styles.image} source={require("./android/app/src/main/assets/images/PrepAppLogo.png")} />

        <StatusBar style="auto" />
        <View style={styles.inputView}>
          <TextInput
            style={styles.TextInput}
            placeholder="Email."
            placeholderTextColor="#003f5c"
            onChangeText={(email) => setEmail(email)}
          />
        </View>

        <View style={styles.inputView}>
          <TextInput
            style={styles.TextInput}
            placeholder="Password."
            placeholderTextColor="#003f5c"
            secureTextEntry={true}
            onChangeText={(password) => setPassword(password)}
          />
        </View>

        <TouchableOpacity>
          <Text style={styles.forgot_button}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginBtn} onPress={() => {
          auth()
            .signInWithEmailAndPassword(email, password)
            .then(userCredentials => {
              //var user = userCredentials.user;
              Alert.alert('User Logged In');
              console.log('User signed in!');
            })
            .catch(error => {
              Alert.alert('User Not Found', error);
              console.error('this is error ', error);
            });
              firestore()
                .collection('Users')
                // Filter results
                .where('Email', '==', email)
                .get()
                .then(querySnapshot => {
                  console.log('Total users: ', querySnapshot.size);
                  
                  querySnapshot.forEach(documentSnapshot => {
                    console.log('User ID: ', documentSnapshot.id, documentSnapshot.data());
                    userdata.push({
                      ...documentSnapshot.data(),
                      key: documentSnapshot.id,
                    });
                    setLoginLocal({
                      ...json,
                      Name: userdata[0].Name,
                      Email: email,
                      Score: userdata[0].Score,
                    })
                  });
                });
        }}>
          <Text style={styles.loginText}>LOGIN</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.SignupBtn}
            onPress={() => {navigation.navigate('Signup')}}>
          <Text style={styles.loginText}>SIGNUP</Text>
        </TouchableOpacity>
      </View>
        </SafeAreaView>
    );
  } else {
    const styles = StyleSheet.create({
      header: {
        backgroundColor: "#DCDCDC",
      },
      headerContent: {
        padding: 30,
        alignItems: 'center',
      },
      avatar: {
        width: 130,
        height: 130,
        borderRadius: 63,
        borderWidth: 4,
        borderColor: "white",
        marginBottom: 10,
      },
      name: {
        fontSize: 22,
        color: "#000000",
        fontWeight: '600',
      },
      userInfo: {
        fontSize: 16,
        color: "#778899",
        fontWeight: '600',
      },
      body: {
        backgroundColor: "#252c4a",
        height: 500,
        alignItems: 'center',
      },
      item: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: "#FFFFFF"
      },
      infoContent: {
        width: 320,
        height:60,
        marginLeft:10,
        paddingLeft: 5,
      },
      iconContent: {
        width:20,
        paddingRight: 5,
      },
      icon: {
        width: 30,
        height: 30,
        marginTop: 20,
        tintColor: "#FFFFFF"
      },
      info: {
        fontSize: 18,
        marginTop: 20,
        color: "#FFFFFF",
      },
       loginBtn: {
        width: "80%",
        borderRadius: 25,
        height: 50,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 40,
         backgroundColor: '#FFCA3C',
      },
    });
    retrieveData().then(thing => setUserData(thing));
    console.log(userdata);
    return (
      <View style={styles.container}>
          <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.openDrawer()} style={{ marginLeft: 10, marginTop: 10 }}>
           <Image style={{
            width: 25,
             height: 25
          }} source={require("./android/app/src/main/assets/images/menu.png")} />
         </TouchableOpacity>
            <View style={styles.headerContent}>
                <Image style={styles.avatar}
              source={require("./android/app/src/main/assets/images/avatar6.png")}/>

                <Text style={styles.name}>{userdata.Name} </Text>
                <Text style={styles.userInfo}>{userdata.Email}</Text>
            </View>
          </View>

          <View style={styles.body}>

          <TouchableOpacity style={styles.item}>
            <View style={styles.iconContent}>
              <Image style={styles.icon} source={require("./android/app/src/main/assets/images/marking.png")} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.info}>Score History: {userdata.Score}</Text>
            </View>
          </TouchableOpacity>

            <TouchableOpacity style={styles.item} onPress={()=> navigation.navigate('Settings')}>
              <View style={styles.iconContent}>
              <Image style={styles.icon} source={require("./android/app/src/main/assets/images/settings_tab.png")}/>
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.info}>Settings</Text>
              </View>
            </TouchableOpacity>

          <TouchableOpacity style={styles.loginBtn} onPress={() => {
          auth()
            .signOut()
            .then(() => {removeData(); console.log(userdata)});
        }}>
            <Text style={styles.loginText, {color:'#ff4444'}}>LOGOUT</Text>
        </TouchableOpacity>
          </View>
      </View>
    );
  }

}

const OlevelStack = createNativeStackNavigator();
function OlevelStackScreen() {
  return (
    <OlevelStack.Navigator>
      <OlevelStack.Screen name="Subjects" component={OlevelSubjects} options={{headerShown: false}}/>
      <OlevelStack.Screen name="OlevelSubjectData" component={OlevelSubjectData} options={{ headerShown: false }} />
      <OlevelStack.Screen name="viewReport" component={viewReport} options={{ headerShown: false }} />
    </OlevelStack.Navigator>
  );
}

const AlevelStack = createNativeStackNavigator();
function AlevelStackScreen() {
  return (
    <AlevelStack.Navigator>
      <AlevelStack.Screen name="Subjects" component={AlevelSubjects} options={{ headerShown: false }} />
    </AlevelStack.Navigator>
  );
}

const IGCSEStack = createNativeStackNavigator();
function IGCSEStackScreen() {
  return (
    <IGCSEStack.Navigator>
      <IGCSEStack.Screen name="Subjects" component={IGCSESubjects} options={{ headerShown: false }} />
    </IGCSEStack.Navigator>
  );
}

const SettingsStack = createNativeStackNavigator();

function SettingStackScreen() {
  return (
    <SettingsStack.Navigator>
      <SettingsStack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }}/>
    </SettingsStack.Navigator>
  );
}

const UserStack = createNativeStackNavigator();

function UserStackScreen() {
  return (
    <UserStack.Navigator>
      <UserStack.Screen name="User" component={UserScreen} options={{ headerShown: false }}/>
    </UserStack.Navigator>
  );
}

const settheme = async (Data) => {
  try {
    await AsyncStorage.setItem('isDarkTheme', Data);
  } catch (err) {
    console.log(err);
  }
};

const gettheme = async () => {
  const value = await AsyncStorage.getItem("isDarkTheme");
  console.log(value);
  return value;
};


export function DrawerContent ({props, navigation}){
  const paperTheme = useTheme();
  const [isDarkTheme, setIsDarkTheme] = React.useState(false);

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
    settheme({darktheme : isDarkTheme});
  }
  return (
    <View style={{flex:1}}>
      <Drawer.Section title="Home">
        <DrawerItem
          icon={({ color, size }) => (
            <Image
              source={require('./android/app/src/main/assets/images/home_tab.png')}
              resizeMode="contain"
              style={{
                width: 25,
                height: 25,
              }}
            />
          )}
          label="Home"
          onPress={() => { navigation.navigate('HomeScreen') }}
        />
      </Drawer.Section>

      <Drawer.Section title="User">
      <DrawerItem
        icon={({ color, size }) => (
          <Image
            source={require('./android/app/src/main/assets/images/User_tab.png')}
            resizeMode="contain"
            style={{
              width: 25,
              height: 25,
            }}
          />
        )}
        label="Profile"
          onPress={() => { navigation.navigate('UserScreen') }}
      />
      </Drawer.Section>
      
      <Drawer.Section title="Settings">
        <TouchableRipple onPress={() => { toggleTheme() }}>
          <View style={styles.preference}>
            <Text>Dark Theme</Text>
            <View pointerEvents="none">
              <Switch/>
            </View>
          </View>
        </TouchableRipple>
      </Drawer.Section>
      
    </View>
  );
      
}

const Drawervar = createDrawerNavigator();

function Drawer1() {

  return (
    <Drawervar.Navigator initialRouteName="HomeScreen" drawerContent={props => <DrawerContent {...props} />}>
      <Drawervar.Screen name="HomeScreen" component={HomeScreen} options={{ headerShown: false }}/>
      <Drawervar.Screen name="UserScreen" component={UserScreen} options={{ headerShown: false }}/>
      <Drawervar.Screen name="Signup" component={Signup} options={{ headerShown: false }}/>
      <Drawervar.Screen name="Settings" component={SettingStackScreen} options={{ headerShown: false }}/>
    </Drawervar.Navigator>
  );
}

const Tab = createBottomTabNavigator();

function OlevelDashboardScreen({route, navigation}) {
  return (    
    <Tab.Navigator tabBarOptions={{
      showLabel: false, activeTintColor: 'grey', 
      inactiveTintColor: 'lightgray',
      activeBackgroundColor: '#20904E',
      inactiveBackgroundColor: '#20904E',
      }}>
      <Tab.Screen name="OlevelStackScreen" component={OlevelStackScreen} options={{ headerShown: false, tabBarIcon:({focused})=>(
            <View style={{justifyContent:'center', alignItems:'center'}}>
              <Image
                source={require('./android/app/src/main/assets/images/home_tab.png')}
                resizeMode="contain"
                style={{
                  width:25,
                  height:25,
                  tintColor: focused ? '#FFCA3C' : 'black',
                }}
              />
              <Text style={{
                color: focused ? '#FFCA3C' : 'black', fontSize:12
              }}>HOME</Text>
            </View>
          )}}/>
      
      <Tab.Screen name="User" component={Drawer1} options={{
        headerShown: false, tabBarIcon: ({ focused }) => (
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Image
              source={require('./android/app/src/main/assets/images/User_tab.png')}
              resizeMode="contain"
              style={{
                width: 25,
                height: 25,
                tintColor: focused ? '#FFCA3C' : 'black',
              }}
            />
            <Text style={{
              color: focused ? '#FFCA3C' : 'black', fontSize: 12
            }}>USER</Text>
          </View>
        ) }} />
    </Tab.Navigator>
  );
}

function IGCSEDashboardScreen({ route, navigation }) {
  return (
    <Tab.Navigator tabBarOptions={{
      showLabel: false, activeTintColor: 'grey',
      inactiveTintColor: 'lightgray',
      activeBackgroundColor: '#20904E',
      inactiveBackgroundColor: '#20904E',
    }}>
      <Tab.Screen name="HomeStackScreen" component={IGCSEStackScreen} options={{
        headerShown: false, tabBarIcon: ({ focused }) => (
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Image
              source={require('./android/app/src/main/assets/images/home_tab.png')}
              resizeMode="contain"
              style={{
                width: 25,
                height: 25,
                tintColor: focused ? '#FFCA3C' : 'black',
              }}
            />
            <Text style={{
              color: focused ? '#FFCA3C' : 'black', fontSize: 12
            }}>HOME</Text>
          </View>
        )
      }} />

      <Tab.Screen name="User" component={Drawer1} options={{
        headerShown: false, tabBarIcon: ({ focused }) => (
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Image
              source={require('./android/app/src/main/assets/images/User_tab.png')}
              resizeMode="contain"
              style={{
                width: 25,
                height: 25,
                tintColor: focused ? '#FFCA3C' : 'black',
              }}
            />
            <Text style={{
              color: focused ? '#FFCA3C' : 'black', fontSize: 12
            }}>USER</Text>
          </View>
        )
      }} />
    </Tab.Navigator>
  );
}

function AlevelDashboardScreen({ route, navigation }) {
  return (
    <Tab.Navigator tabBarOptions={{
      showLabel: false, activeTintColor: 'grey',
      inactiveTintColor: 'lightgray',
      activeBackgroundColor: '#20904E',
      inactiveBackgroundColor: '#20904E',
    }}>
      <Tab.Screen name="HomeStackScreen" component={AlevelStackScreen} options={{
        headerShown: false, tabBarIcon: ({ focused }) => (
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Image
              source={require('./android/app/src/main/assets/images/home_tab.png')}
              resizeMode="contain"
              style={{
                width: 25,
                height: 25,
                tintColor: focused ? '#FFCA3C' : 'black',
              }}
            />
            <Text style={{
              color: focused ? '#FFCA3C' : 'black', fontSize: 12
            }}>HOME</Text>
          </View>
        )
      }} />

      <Tab.Screen name="User" component={Drawer1} options={{
        headerShown: false, tabBarIcon: ({ focused }) => (
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Image
              source={require('./android/app/src/main/assets/images/User_tab.png')}
              resizeMode="contain"
              style={{
                width: 25,
                height: 25,
                tintColor: focused ? '#FFCA3C' : 'black',
              }}
            />
            <Text style={{
              color: focused ? '#FFCA3C' : 'black', fontSize: 12
            }}>USER</Text>
          </View>
        )
      }} />
    </Tab.Navigator>
  );
}

const MainStack = createNativeStackNavigator();


function App() {
  useEffect(() => {
    SplashScreen.hide();
  }, [])
  const [isDarkTheme, setIsDarkTheme] = React.useState(false);
  
  const istheme = gettheme();
  console.log(istheme);

  const CustomDefaultTheme = {
    ...NavigationDefaultTheme,
    ...PaperDefaultTheme,
    colors: {
      ...NavigationDefaultTheme.colors,
      ...PaperDefaultTheme.colors,
      background: '#ffffff',
      text: '#333333'
    }
  }

  const CustomDarkTheme = {
    ...NavigationDarkTheme,
    ...PaperDarkTheme,
    colors: {
      ...NavigationDarkTheme.colors,
      ...PaperDarkTheme.colors,
      background: '#333333',
      text: '#ffffff'
    }
  }
  const theme = isDarkTheme ? CustomDarkTheme : CustomDefaultTheme;
    return (
      <PaperProvider theme={theme}>
        <NavigationContainer theme={theme}>
        <MainStack.Navigator initialRouteName="HomeScreen" >
          <MainStack.Screen name="HomeScreen" component={Drawer1} options={{headerShown:false}}/>
          <MainStack.Screen name="DashboardScreen1" component={OlevelStackScreen} options={{ headerShown: false }}/>
          <MainStack.Screen name="DashboardScreen2" component={AlevelStackScreen} options={{ headerShown: false }} />
          <MainStack.Screen name="DashboardScreen3" component={IGCSEStackScreen} options={{ headerShown: false }} />
        </MainStack.Navigator>
      </NavigationContainer>
      </PaperProvider>
    );
}

export default App;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop:300
  },

  image: {
    marginBottom: 40,
    width: 80,
    height: 80,
  },

  inputView: {
    borderWidth: 1,
    borderRadius: 30,
    width: "70%",
    height: 45,
    marginBottom: 20,

    alignItems: "center",
  },

  TextInput: {
    height: 50,
    flex: 1,
    padding: 10,
    marginLeft: 20,
    width: "70%",
    
  },

  forgot_button: {
    height: 30,
    marginBottom: 30,
  },

  loginBtn: {
    width: "80%",
    borderRadius: 25,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
    backgroundColor: "#20904E",
  },
  SignupBtn: {
    width: "80%",
    borderRadius: 25,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
    backgroundColor: "#FFCA3C",
  },
  drawerContent: {
    flex: 1,
  },
  userInfoSection: {
    paddingLeft: 20,
  },
  title: {
    fontSize: 16,
    marginTop: 3,
    fontWeight: 'bold',
  },
  caption: {
    fontSize: 14,
    lineHeight: 14,
  },
  row: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  paragraph: {
    fontWeight: 'bold',
    marginRight: 3,
  },
  drawerSection: {
    marginTop: 15,
  },
  bottomDrawerSection: {
    marginBottom: 15,
    borderTopColor: '#f4f4f4',
    borderTopWidth: 1
  },
  preference: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
});