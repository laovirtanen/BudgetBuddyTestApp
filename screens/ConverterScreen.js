// This is a test app to test the API.
// Fetching currency list, retrieving exchange rates, handling primary and fallback endpoints.
// Axios is used to connect to API.
// Added thorough error handling for easier error detection.

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import RNPickerSelect from "react-native-picker-select";
import axios from "axios";
import pickerSelectStyles from "../styles/pickerStyles.js";
import styles from "../styles/converStyles.js";

const ConverterScreen = () => {
  const [amount, setAmount] = useState("");
  const [baseCurrency, setBaseCurrency] = useState("EUR");
  const [targetCurrency, setTargetCurrency] = useState("USD");
  const [currencies, setCurrencies] = useState([]);
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const primaryAPI =
    "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies.json"; // Primary endpoint
  const fallbackAPI =
    "https://latest.currency-api.pages.dev/v1/currencies.json"; // Backup API

  // Fetch currencies on component mount
  useEffect(() => {
    fetchCurrencies(primaryAPI, fallbackAPI);
  }, []);

  const fetchCurrencies = async (primaryURL, fallbackURL) => {
    try {
      const response = await axios.get(primaryURL);
      console.log("Primary API response:", response.data);
      if (response.data && typeof response.data === "object") {
        const currencyKeys = Object.keys(response.data).map((key) => ({
          label: `${key.toUpperCase()} - ${response.data[key]}`,
          value: key.toUpperCase(),
        }));
        setCurrencies(currencyKeys);
      } else {
        throw new Error("Invalid data format from primary API");
      }
    } catch (error) {
      console.warn("Primary API failed, trying fallback...", error);
      try {
        const fallbackResponse = await axios.get(fallbackURL);
        console.log("Fallback API response:", fallbackResponse.data);
        if (
          fallbackResponse.data &&
          typeof fallbackResponse.data === "object"
        ) {
          const currencyKeys = Object.keys(fallbackResponse.data).map(
            (key) => ({
              label: `${key.toUpperCase()} - ${fallbackResponse.data[key]}`,
              value: key.toUpperCase(),
            })
          );
          setCurrencies(currencyKeys);
        } else {
          throw new Error("Invalid data format from fallback API");
        }
      } catch (fallbackError) {
        console.error("Both APIs failed:", fallbackError);
        Alert.alert(
          "Error",
          "Unable to fetch currency data. Please try again later."
        );
        setError("Unable to fetch currency data. Please try again later.");
      }
    }
  };

  const handleConvert = async () => {
    if (!amount || isNaN(amount)) {
      Alert.alert(
        "Invalid Input",
        "Please enter a valid number for the amount."
      );
      return;
    }

    if (baseCurrency === targetCurrency) {
      Alert.alert(
        "Invalid Selection",
        "Base and target currencies cannot be the same."
      );
      return;
    }

    setLoading(true);
    setError("");
    setConvertedAmount(null);

    const date = "latest";
    const apiVersion = "v1";
    const endpoint = `currencies/${baseCurrency.toLowerCase()}.json`;

    const primaryURL = `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@${date}/${apiVersion}/${endpoint}`;
    const fallbackURL = `https://${date}.currency-api.pages.dev/${apiVersion}/${endpoint}`;

    try {
      const response = await axios.get(primaryURL);
      console.log("Primary conversion API response:", response.data);
      if (response.data && response.data[baseCurrency.toLowerCase()]) {
        const rates = response.data[baseCurrency.toLowerCase()];
        const rate = rates[targetCurrency.toLowerCase()];
        if (rate) {
          setConvertedAmount((amount * rate).toFixed(2));
        } else {
          throw new Error("Target currency rate not found");
        }
      } else {
        throw new Error("Invalid data format from primary conversion API");
      }
    } catch (error) {
      console.warn("Primary API failed, trying fallback...", error);
      try {
        const fallbackResponse = await axios.get(fallbackURL);
        console.log("Fallback conversion API response:", fallbackResponse.data);
        if (
          fallbackResponse.data &&
          fallbackResponse.data[baseCurrency.toLowerCase()]
        ) {
          const rates = fallbackResponse.data[baseCurrency.toLowerCase()];
          const rate = rates[targetCurrency.toLowerCase()];
          if (rate) {
            setConvertedAmount((amount * rate).toFixed(2));
          } else {
            throw new Error("Target currency rate not found in fallback API");
          }
        } else {
          throw new Error("Invalid data format from fallback conversion API");
        }
      } catch (fallbackError) {
        console.error("Both APIs failed:", fallbackError);
        Alert.alert(
          "Error",
          "Unable to fetch conversion rates. Please try again later."
        );
        setError("Unable to fetch conversion rates. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const swapCurrencies = () => {
    const temp = baseCurrency;
    setBaseCurrency(targetCurrency);
    setTargetCurrency(temp);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Currency Converter</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter amount"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />

      <RNPickerSelect
        onValueChange={(value) => setBaseCurrency(value)}
        items={currencies}
        value={baseCurrency}
        style={pickerSelectStyles}
        placeholder={{ label: "Select Base Currency", value: null }}
      />

      <RNPickerSelect
        onValueChange={(value) => setTargetCurrency(value)}
        items={currencies}
        value={targetCurrency}
        style={pickerSelectStyles}
        placeholder={{ label: "Select Target Currency", value: null }}
      />

      {/* Swap Button moved here */}
      <TouchableOpacity style={styles.swapButton} onPress={swapCurrencies}>
        <Text style={styles.swapButtonText}>⇄ Swap</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleConvert}>
        <Text style={styles.buttonText}>Convert</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : convertedAmount ? (
        <Text style={styles.result}>
          {amount} {baseCurrency} = {convertedAmount} {targetCurrency}
        </Text>
      ) : null}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

export default ConverterScreen;
