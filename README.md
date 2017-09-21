# Demo Urbanairship App

### Development env

* install NodeJs (6.x or higher)
* install React native ```npm install -g react-native-cli```
* install Android Studio and/or Xcode (only for Mac)
* for Android, configure variables 
```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/platform-tools
```
* go to project folder and run ```npm install```

More information you can find here 
https://facebook.github.io/react-native/docs/getting-started.html


### Run application

* ```npm start```
* ```react-native run-android``` or ```react-native run-ios```
* for start logger ```react-native log-android``` or ```react-native log-ios```


### Before build IOS app

Before build IOS app you need to do steps from this doc
https://docs.urbanairship.com/platform/react-native/#ios

and this doc 

https://github.com/rebeccahughes/react-native-device-info

