import { AccessibilityInfo, Platform } from 'react-native';

/**
 * Utility for accessibility features
 */
class AccessibilityHelper {
  /**
   * Check if screen reader is enabled
   * @returns Promise resolving to boolean indicating if screen reader is enabled
   */
  async isScreenReaderEnabled(): Promise<boolean> {
    return await AccessibilityInfo.isScreenReaderEnabled();
  }

  /**
   * Announce a message to screen readers
   * @param message - The message to announce
   */
  announceForAccessibility(message: string): void {
    AccessibilityInfo.announceForAccessibility(message);
  }

  /**
   * Check if reduced motion is enabled
   * @returns Promise resolving to boolean indicating if reduced motion is enabled
   */
  async isReducedMotionEnabled(): Promise<boolean> {
    return await AccessibilityInfo.isReducedMotionEnabled();
  }

  /**
   * Get accessibility props for a touchable element
   * @param label - Accessibility label
   * @param hint - Accessibility hint
   * @param role - Accessibility role
   * @returns Object with accessibility props
   */
  getTouchableProps(
    label: string,
    hint?: string,
    role: 'button' | 'link' | 'toggle' | 'search' | 'image' | 'keyboardkey' | 'text' | 'adjustable' = 'button'
  ): any {
    if (Platform.OS === 'ios') {
      return {
        accessible: true,
        accessibilityLabel: label,
        accessibilityHint: hint,
        accessibilityRole: role,
      };
    } else {
      return {
        accessible: true,
        accessibilityLabel: label,
        accessibilityHint: hint,
        accessibilityRole: role,
      };
    }
  }

  /**
   * Get accessibility props for a text element
   * @param isHeading - Whether the text is a heading
   * @param level - Heading level (1-6)
   * @returns Object with accessibility props
   */
  getTextProps(isHeading: boolean = false, level: 1 | 2 | 3 | 4 | 5 | 6 = 1): any {
    if (isHeading) {
      if (Platform.OS === 'ios') {
        return {
          accessible: true,
          accessibilityRole: 'header',
          accessibilityTraits: ['header'],
        };
      } else {
        return {
          accessible: true,
          accessibilityRole: 'heading',
          accessibilityLevel: level,
        };
      }
    }
    return {
      accessible: true,
      accessibilityRole: 'text',
    };
  }

  /**
   * Get accessibility props for an image
   * @param description - Description of the image
   * @returns Object with accessibility props
   */
  getImageProps(description: string): any {
    return {
      accessible: true,
      accessibilityLabel: description,
      accessibilityRole: 'image',
    };
  }

  /**
   * Get accessibility props for a form field
   * @param label - Label for the field
   * @param error - Error message if any
   * @param required - Whether the field is required
   * @returns Object with accessibility props
   */
  getFormFieldProps(label: string, error?: string, required: boolean = false): any {
    let accessibilityLabel = label;
    if (required) {
      accessibilityLabel += ', required';
    }
    if (error) {
      accessibilityLabel += `, error: ${error}`;
    }

    return {
      accessible: true,
      accessibilityLabel,
      accessibilityRole: 'none',
      accessibilityState: {
        disabled: false,
        selected: false,
        checked: false,
        busy: false,
        expanded: false,
        ...(error ? { invalid: true } : {}),
      },
    };
  }
}

export default new AccessibilityHelper();
