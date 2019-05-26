import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Button,
  Image,
  Dimensions,
  AsyncStorage,
  ActivityIndicator,
  StatusBar
} from "react-native";
import { ImagePicker } from "expo";
import { FileSystem, KeepAwake } from "expo";
import ReactNativeZoomableView from "@dudigital/react-native-zoomable-view/src/ReactNativeZoomableView";

const renderIf = cond => elm => (cond ? elm : null);

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

class App extends React.Component {
  state = {
    image: "",
    loading: false
  };

  async componentDidMount() {
    const uri = await AsyncStorage.getItem("imageUri");
    if (uri) {
      await this.readImage(uri);
    }
  }

  openFile = async () => {
    const {
      cancelled,
      uri,
      type,
      width,
      height
    } = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All
    });

    if (!cancelled) {
      await this.readImage(uri);
    }
  };
  readImage = async uri => {
    this.setState({ loading: true });
    const image = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingTypes.Base64
    });

    this.setState({ image, loading: false });
    if (image) AsyncStorage.setItem("imageUri", uri);
  };
  render() {
    const { image, loading } = this.state;

    return (
      <View style={styles.container}>
        <StatusBar hidden />
        <KeepAwake />
        <Text style={styles.title}>Awake Always</Text>
        <View style={styles.buttons}>
          <Button onPress={this.openFile} title="Open (.png)" />
          {renderIf(loading)(<ActivityIndicator />)}
        </View>
        <View style={styles.zoomableWrapper}>
          <ReactNativeZoomableView
            maxZoom={3}
            minZoom={0.5}
            zoomStep={0.5}
            initialZoom={1}
            bindToBorders={true}
            onZoomAfter={this.logOutZoomState}
            style={styles.imageWrapper}
          >
            {renderIf(image)(
              <Image
                style={{
                  borderWidth: 2,
                  borderColor: "green",
                  width: screenHeight,
                  transform: [{ rotateZ: "90deg" }],
                  height: screenWidth,
                  resizeMode: "contain"
                }}
                source={{ uri: "data:image/png;base64," + image }}
                // onError={console.warn}
              />
            )}
          </ReactNativeZoomableView>
        </View>
      </View>
    );
  }
}
export default App;

const styles = StyleSheet.create({
  buttons: {
    flexDirection: "row"
  },
  zoomableWrapper: {
    flex: 1,
    width: screenWidth,
    borderWidth: 1,
    overflow: "hidden"
  },
  imageWrapper: {
    flex: 1,
    overflow: "hidden",
    flexDirection: "column",
    alignItems: "center"
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center"
  },
  title: {
    fontSize: 25
  }
});
