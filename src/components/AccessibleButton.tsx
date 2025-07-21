import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import accessibility from '../utils/accessibility';

interface AccessibleButtonProps {
  title: string;
  onPress: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  title,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  // Get accessibility props
  const accessibilityProps = accessibility.getTouchableProps(
    accessibilityLabel || title,
    accessibilityHint || `Activates ${title}`,
    'button'
  );

  // Determine button styles based on variant
  const getButtonStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondaryButton;
      case 'outline':
        return styles.outlineButton;
      case 'danger':
        return styles.dangerButton;
      case 'primary':
      default:
        return styles.primaryButton;
    }
  };

  // Determine text styles based on variant
  const getTextStyle = () => {
    switch (variant) {
      case 'outline':
        return styles.outlineButtonText;
      case 'secondary':
      case 'primary':
      case 'danger':
      default:
        return styles.buttonText;
    }
  };

  // Determine size styles
  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return styles.smallButton;
      case 'large':
        return styles.largeButton;
      case 'medium':
      default:
        return styles.mediumButton;
    }
  };

  // Determine text size styles
  const getTextSizeStyle = () => {
    switch (size) {
      case 'small':
        return styles.smallButtonText;
      case 'large':
        return styles.largeButtonText;
      case 'medium':
      default:
        return styles.mediumButtonText;
    }
  };

  // Determine loading indicator color
  const getLoadingColor = () => {
    switch (variant) {
      case 'outline':
        return '#3B82F6'; // Blue for outline buttons
      case 'secondary':
      case 'primary':
      case 'danger':
      default:
        return '#FFFFFF'; // White for filled buttons
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isLoading || disabled}
      style={[
        styles.button,
        getButtonStyle(),
        getSizeStyle(),
        disabled && styles.disabledButton,
        style,
      ]}
      activeOpacity={0.8}
      {...accessibilityProps}
      accessibilityState={{
        disabled: isLoading || disabled,
        busy: isLoading,
      }}
    >
      {isLoading ? (
        <ActivityIndicator color={getLoadingColor()} size="small" />
      ) : (
        <Text
          style={[
            getTextStyle(),
            getTextSizeStyle(),
            disabled && styles.disabledText,
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  primaryButton: {
    backgroundColor: '#3B82F6', // Blue
  },
  secondaryButton: {
    backgroundColor: '#6B7280', // Gray
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  dangerButton: {
    backgroundColor: '#EF4444', // Red
  },
  smallButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    minHeight: 32,
  },
  mediumButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    minHeight: 44,
  },
  largeButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    minHeight: 54,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  outlineButtonText: {
    color: '#3B82F6',
    fontWeight: '600',
    textAlign: 'center',
  },
  smallButtonText: {
    fontSize: 12,
  },
  mediumButtonText: {
    fontSize: 14,
  },
  largeButtonText: {
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: '#E5E7EB',
    borderColor: '#E5E7EB',
  },
  disabledText: {
    color: '#9CA3AF',
  },
});

export default AccessibleButton;
