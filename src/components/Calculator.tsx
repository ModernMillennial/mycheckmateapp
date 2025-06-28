import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const Calculator: React.FC<Props> = ({ visible, onClose }) => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const { width } = Dimensions.get('window');
  const buttonSize = (width - 80) / 4; // 4 columns with padding

  const inputNumber = (num: string) => {
    if (waitingForOperand) {
      setDisplay(num);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const inputOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue: number, secondValue: number, op: string): number => {
    switch (op) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '*':
        return firstValue * secondValue;
      case '/':
        return firstValue / secondValue;
      case '=':
        return secondValue;
      default:
        return secondValue;
    }
  };

  const performCalculation = () => {
    const inputValue = parseFloat(display);

    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation);
      setDisplay(String(newValue));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForOperand(true);
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const clearEntry = () => {
    setDisplay('0');
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  const toggleSign = () => {
    if (display !== '0') {
      setDisplay(display.charAt(0) === '-' ? display.substr(1) : '-' + display);
    }
  };

  const CalculatorButton = ({ 
    onPress, 
    title, 
    type = 'number',
    span = 1 
  }: { 
    onPress: () => void; 
    title: string; 
    type?: 'number' | 'operator' | 'equals' | 'clear';
    span?: number;
  }) => {
    const getButtonStyle = () => {
      switch (type) {
        case 'operator':
          return 'bg-blue-500 active:bg-blue-600';
        case 'equals':
          return 'bg-green-500 active:bg-green-600';
        case 'clear':
          return 'bg-red-500 active:bg-red-600';
        default:
          return 'bg-gray-200 active:bg-gray-300';
      }
    };

    const getTextStyle = () => {
      return type === 'number' ? 'text-gray-800' : 'text-white';
    };

    return (
      <Pressable
        onPress={onPress}
        style={{
          width: span === 2 ? buttonSize * 2 + 10 : buttonSize,
          height: buttonSize * 0.8,
        }}
        className={`${getButtonStyle()} rounded-lg items-center justify-center m-1`}
      >
        <Text className={`${getTextStyle()} text-xl font-semibold`}>
          {title}
        </Text>
      </Pressable>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-200">
          <Text className="text-lg font-semibold text-gray-900">
            Calculator
          </Text>
          <Pressable
            onPress={onClose}
            className="p-2"
          >
            <Ionicons name="close" size={24} color="#374151" />
          </Pressable>
        </View>

        <View className="flex-1 p-4">
          {/* Display */}
          <View className="bg-gray-50 rounded-lg p-6 mb-6">
            <Text
              className="text-right text-4xl font-light text-gray-800"
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {display}
            </Text>
          </View>

          {/* Buttons */}
          <View className="flex-1 justify-center">
            {/* Row 1 */}
            <View className="flex-row justify-center mb-2">
              <CalculatorButton onPress={clear} title="C" type="clear" />
              <CalculatorButton onPress={clearEntry} title="CE" type="clear" />
              <CalculatorButton onPress={toggleSign} title="±" type="operator" />
              <CalculatorButton onPress={() => inputOperation('/')} title="÷" type="operator" />
            </View>

            {/* Row 2 */}
            <View className="flex-row justify-center mb-2">
              <CalculatorButton onPress={() => inputNumber('7')} title="7" />
              <CalculatorButton onPress={() => inputNumber('8')} title="8" />
              <CalculatorButton onPress={() => inputNumber('9')} title="9" />
              <CalculatorButton onPress={() => inputOperation('*')} title="×" type="operator" />
            </View>

            {/* Row 3 */}
            <View className="flex-row justify-center mb-2">
              <CalculatorButton onPress={() => inputNumber('4')} title="4" />
              <CalculatorButton onPress={() => inputNumber('5')} title="5" />
              <CalculatorButton onPress={() => inputNumber('6')} title="6" />
              <CalculatorButton onPress={() => inputOperation('-')} title="−" type="operator" />
            </View>

            {/* Row 4 */}
            <View className="flex-row justify-center mb-2">
              <CalculatorButton onPress={() => inputNumber('1')} title="1" />
              <CalculatorButton onPress={() => inputNumber('2')} title="2" />
              <CalculatorButton onPress={() => inputNumber('3')} title="3" />
              <CalculatorButton onPress={() => inputOperation('+')} title="+" type="operator" />
            </View>

            {/* Row 5 */}
            <View className="flex-row justify-center">
              <CalculatorButton onPress={() => inputNumber('0')} title="0" span={2} />
              <CalculatorButton onPress={inputDecimal} title="." />
              <CalculatorButton onPress={performCalculation} title="=" type="equals" />
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default Calculator;