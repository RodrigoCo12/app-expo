// import {
//   View,
//   Text,
//   Platform,
//   KeyboardAvoidingView,
//   TextInput,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
// } from "react-native";
// import styles from "../../assets/styles/signup.styles";
// import { Ionicons } from "@expo/vector-icons";
// import COLORS from "../../constants/colors";
// import { useState } from "react";
// import { Link, useRouter } from "expo-router";
// import { useAuthStore } from "../../store/authStore";

// export default function Signup() {
//   const [username, setUsername] = useState("");
//   // const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);

//   const { user, isLoading, register, token } = useAuthStore();

//   const router = useRouter();

//   const handleSignUp = async () => {
//     const result = await register(username, password);

//     if (!result.success) Alert.alert("Error", result.error);
//   };

//   // console.log(token);
//   // console.log(user);
//   return (
//     <KeyboardAvoidingView
//       style={{ flex: 1 }}
//       behavior={Platform.OS === "ios" ? "padding" : "height"}
//     >
//       <View style={styles.container}>
//         <View style={styles.card}>
//           {/* HEADER */}
//           <View style={styles.header}>
//             <Text style={styles.title}>Registrate</Text>
//           </View>

//           <View style={styles.formContainer}>
//             {/* USERNAME INPUT */}
//             <View style={styles.inputGroup}>
//               <Text style={styles.label}>Username</Text>
//               <View style={styles.inputContainer}>
//                 <Ionicons
//                   name="person-outline"
//                   size={20}
//                   color={COLORS.primary}
//                   style={styles.inputIcon}
//                 />
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Usuario"
//                   placeholderTextColor={COLORS.placeholderText}
//                   value={username}
//                   onChangeText={setUsername}
//                   autoCapitalize="none"
//                 />
//               </View>
//             </View>

//             {/* PASSWORD INPUT */}
//             <View style={styles.inputGroup}>
//               <Text style={styles.label}>Password</Text>
//               <View style={styles.inputContainer}>
//                 <Ionicons
//                   name="lock-closed-outline"
//                   size={20}
//                   color={COLORS.primary}
//                   style={styles.inputIcon}
//                 />
//                 <TextInput
//                   style={styles.input}
//                   placeholder="******"
//                   placeholderTextColor={COLORS.placeholderText}
//                   value={password}
//                   onChangeText={setPassword}
//                   secureTextEntry={!showPassword}
//                 />
//                 <TouchableOpacity
//                   onPress={() => setShowPassword(!showPassword)}
//                   style={styles.eyeIcon}
//                 >
//                   <Ionicons
//                     name={showPassword ? "eye-outline" : "eye-off-outline"}
//                     size={20}
//                     color={COLORS.primary}
//                   />
//                 </TouchableOpacity>
//               </View>
//             </View>

//             {/* SIGNUP BUTTON */}
//             <TouchableOpacity style={styles.button} onPress={handleSignUp} disabled={isLoading}>
//               {isLoading ? (
//                 <ActivityIndicator color="#fff" />
//               ) : (
//                 <Text style={styles.buttonText}>Sign Up</Text>
//               )}
//             </TouchableOpacity>

//             {/* FOOTER */}
//             <View style={styles.footer}>
//               <Text style={styles.footerText}>Already have an account?</Text>
//               <TouchableOpacity>
//                 <Link href={"/"}>
//                   <Text style={styles.link}>Login</Text>
//                 </Link>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </View>
//     </KeyboardAvoidingView>
//   );
// }
import {
  View,
  Text,
  Platform,
  KeyboardAvoidingView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import styles from "../../assets/styles/signup.styles";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../constants/colors";
import { useState } from "react";
import { Link, useRouter } from "expo-router";
import { useAuthStore } from "../../store/authStore";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [numeroGuardias, setNumeroGuardias] = useState("1");
  const [showPassword, setShowPassword] = useState(false);

  const { user, isLoading, register, token } = useAuthStore();

  const router = useRouter();

  const handleSignUp = async () => {
    // Validar que el número de guardias sea al menos 1
    const numGuardias = parseInt(numeroGuardias);
    if (isNaN(numGuardias) || numGuardias < 1) {
      Alert.alert("Error", "El número de guardias debe ser al menos 1");
      return;
    }

    const result = await register(username, password, numGuardias);

    if (!result.success) Alert.alert("Error", result.error);
  };

  // Función para incrementar el número de guardias
  const incrementGuardias = () => {
    const currentValue = parseInt(numeroGuardias) || 1;
    setNumeroGuardias((currentValue + 1).toString());
  };

  // Función para decrementar el número de guardias
  const decrementGuardias = () => {
    const currentValue = parseInt(numeroGuardias) || 1;
    if (currentValue > 1) {
      setNumeroGuardias((currentValue - 1).toString());
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.container}>
        <View style={styles.card}>
          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.title}>Registrate</Text>
          </View>

          <View style={styles.formContainer}>
            {/* USERNAME INPUT */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Username</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={COLORS.primary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Usuario"
                  placeholderTextColor={COLORS.placeholderText}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* PASSWORD INPUT */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={COLORS.primary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="******"
                  placeholderTextColor={COLORS.placeholderText}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color={COLORS.primary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* NÚMERO DE GUARDIAS INPUT */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Número de Guardias</Text>
              <View style={styles.guardiasContainer}>
                <TouchableOpacity
                  style={styles.guardiasButton}
                  onPress={decrementGuardias}
                  disabled={parseInt(numeroGuardias) <= 1}
                >
                  <Ionicons
                    name="remove-outline"
                    size={20}
                    color={parseInt(numeroGuardias) <= 1 ? COLORS.gray : COLORS.primary}
                  />
                </TouchableOpacity>

                <TextInput
                  style={styles.guardiasInput}
                  value={numeroGuardias}
                  onChangeText={(text) => {
                    // Solo permitir números
                    if (/^\d*$/.test(text)) {
                      setNumeroGuardias(text);
                    }
                  }}
                  keyboardType="numeric"
                  textAlign="center"
                />

                <TouchableOpacity style={styles.guardiasButton} onPress={incrementGuardias}>
                  <Ionicons name="add-outline" size={20} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
              <Text style={styles.guardiasNote}>Mínimo: 1 guardia</Text>
            </View>

            {/* SIGNUP BUTTON */}
            <TouchableOpacity style={styles.button} onPress={handleSignUp} disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Sign Up</Text>
              )}
            </TouchableOpacity>

            {/* FOOTER */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account?</Text>
              <TouchableOpacity>
                <Link href={"/"}>
                  <Text style={styles.link}>Login</Text>
                </Link>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
