import React, { useState, useEffect } from 'react';
import {
  Image,
  ImageProps,
  StyleSheet,
  View,
  ActivityIndicator,
  Platform,
} from 'react-native';

interface LazyImageProps extends ImageProps {
  placeholderColor?: string;
  showLoader?: boolean;
  loaderColor?: string;
  loaderSize?: 'small' | 'large';
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
  onError?: (error: any) => void;
}

const LazyImage: React.FC<LazyImageProps> = ({
  source,
  style,
  placeholderColor = '#E5E7EB',
  showLoader = true,
  loaderColor = '#3B82F6',
  loaderSize = 'small',
  onLoadStart,
  onLoadEnd,
  onError,
  ...rest
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Reset loading state when source changes
  useEffect(() => {
    setLoading(true);
    setError(false);
  }, [source]);

  const handleLoadStart = () => {
    setLoading(true);
    onLoadStart?.();
  };

  const handleLoadEnd = () => {
    setLoading(false);
    onLoadEnd?.();
  };

  const handleError = (e: any) => {
    setError(true);
    setLoading(false);
    onError?.(e);
  };

  return (
    <View style={[styles.container, style]}>
      {loading && (
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: placeholderColor },
            styles.placeholder,
          ]}
        >
          {showLoader && (
            <ActivityIndicator color={loaderColor} size={loaderSize} />
          )}
        </View>
      )}

      <Image
        source={source}
        style={[
          StyleSheet.absoluteFill,
          styles.image,
          error && styles.hidden,
        ]}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        {...rest}
      />

      {error && (
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: placeholderColor },
            styles.errorContainer,
          ]}
        >
          <Image
            source={require('../../assets/image-error.png')}
            style={styles.errorIcon}
            resizeMode="contain"
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  hidden: {
    display: 'none',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorIcon: {
    width: '30%',
    height: '30%',
    tintColor: '#9CA3AF',
  },
});

export default React.memo(LazyImage);
