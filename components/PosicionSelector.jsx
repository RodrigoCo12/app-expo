// components/PostSelector.js
import { View, Text, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";

import styles from "../assets/styles/create.styles";

const PosicionSelector = ({ selectedPost, setSelectedPost, filter }) => {
  return (
    <View style={styles.inputContainer}>
      <Picker
        selectedValue={selectedPost}
        onValueChange={(itemValue) => setSelectedPost(itemValue)}
        style={styles.inputList}
        dropdownIconColor="#000000"
      >
        {filter ? (
          <Picker.Item label="Mostrar Todos" value="Todos" />
        ) : (
          <Picker.Item label="Seleccione el puesto" value={null} />
        )}
        <Picker.Item label="Entrada Principal" value="Entrada principal" />
        <Picker.Item label="Recepción" value="Recepción" />
        <Picker.Item label="Área de Carga" value="Área de Carga" />
        <Picker.Item label="Estacionamiento" value="Estacionamiento" />
      </Picker>
    </View>
  );
};

export default PosicionSelector;
