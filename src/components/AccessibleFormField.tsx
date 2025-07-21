import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import accessibility from '../utils/accessibility';

interface AccessibleFormFieldProps extends TextInputProps {
  label: string;
  error?: string;
  required?: boolean;
  containerStyle?: ViewStyle;
  labelStyle?: ViewStyle;
  inputStyle?: ViewStyle;
  errorStyle?: ViewStyle;
}

const AccessibleFormField: React.FC<AccessibleFormFieldProps> = ({
  label,
  error,
  required = false,
  containerStyle,
  labelStyle,
  inputStyle,
  errorStyle,
  ...inputProps
}) => {
  // Get accessibility props
  const accessibilityProps = accessibility.getFormFieldProps(label, error, required);

  return (
    <View style={[styles.container, containerStyle]}>
      <Text
        style={[styles.label, labelStyle]}
        {...accessibility.getTextProps()}
      >
        {label}
        {required && <Text style={styles.requiredStar}> *</Text>}
      </Text>
      
      <TextInput
        style={[
          styles.input,
          error ? styles.inputError : {},
          inputStyle,
        ]}
        {...inputProps}
        {...accessibilityProps}
      />
      
      {error && (
        <Text
          style={[styles.errorText, errorStyle]}
          {...accessibility.getTextProps()}
        >
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  requiredStar: {
    color: '#EF4444',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
    minHeight: 44, // Minimum touch target size
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
});

export default AccessibleFormField;
