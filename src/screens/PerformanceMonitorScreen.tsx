import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import performance from '../utils/performance';

interface Props {
  navigation: any;
}

interface PerformanceMetric {
  name: string;
  value: string;
  status: 'good' | 'warning' | 'critical';
}

const PerformanceMonitorScreen: React.FC<Props> = ({ navigation }) => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [memoryUsage, setMemoryUsage] = useState<number>(0);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Collect performance metrics
  useEffect(() => {
    collectMetrics();
  }, []);

  const collectMetrics = async () => {
    // Start timing the metrics collection
    performance.startTimer('metrics_collection');

    // Simulate collecting various performance metrics
    // In a real app, these would be actual measurements
    const newMetrics: PerformanceMetric[] = [
      {
        name: 'Render Time (Avg)',
        value: '16ms',
        status: 'good',
      },
      {
        name: 'API Response Time',
        value: '450ms',
        status: 'good',
      },
      {
        name: 'App Startup Time',
        value: '1.2s',
        status: 'good',
      },
      {
        name: 'Frame Rate',
        value: '58fps',
        status: 'good',
      },
      {
        name: 'Database Query Time',
        value: '85ms',
        status: 'warning',
      },
      {
        name: 'Transaction List Render',
        value: '120ms',
        status: 'warning',
      },
    ];

    // Simulate memory usage
    const memory = Math.floor(Math.random() * 150) + 50; // 50-200MB
    setMemoryUsage(memory);

    // End timing and log the result
    const duration = performance.endTimer('metrics_collection');
    console.log(`Metrics collection took ${duration}ms`);

    setMetrics(newMetrics);
    setLastUpdated(new Date());
  };

  const runPerformanceTest = async () => {
    Alert.alert(
      'Performance Test',
      'Running a performance test will simulate heavy operations to measure app responsiveness. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Run Test',
          onPress: async () => {
            // Start timing the test
            performance.startTimer('performance_test');

            // Simulate a heavy operation
            const operations = Array(100)
              .fill(0)
              .map(
                (_, i) => () =>
                  new Promise<number>((resolve) => {
                    setTimeout(() => {
                      // Simulate some CPU-intensive work
                      let result = 0;
                      for (let j = 0; j < 10000; j++) {
                        result += Math.sqrt(j);
                      }
                      resolve(i);
                    }, 10);
                  })
              );

            // Run the operations in batches
            await performance.batchOperations(operations, 10, 50);

            // End timing and show the result
            const duration = performance.endTimer('performance_test');
            Alert.alert(
              'Test Complete',
              `Performance test completed in ${duration}ms`
            );

            // Refresh metrics
            collectMetrics();
          },
        },
      ]
    );
  };

  const getStatusColor = (status: 'good' | 'warning' | 'critical'): string => {
    switch (status) {
      case 'good':
        return '#10B981'; // green
      case 'warning':
        return '#F59E0B'; // yellow
      case 'critical':
        return '#EF4444'; // red
      default:
        return '#6B7280'; // gray
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Performance Monitor</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Memory Usage */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Memory Usage</Text>
          <View style={styles.memoryContainer}>
            <View style={styles.memoryBarContainer}>
              <View
                style={[
                  styles.memoryBar,
                  {
                    width: `${Math.min(100, (memoryUsage / 200) * 100)}%`,
                    backgroundColor:
                      memoryUsage < 100
                        ? '#10B981'
                        : memoryUsage < 150
                        ? '#F59E0B'
                        : '#EF4444',
                  },
                ]}
              />
            </View>
            <Text style={styles.memoryText}>{memoryUsage} MB</Text>
          </View>
        </View>

        {/* Performance Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance Metrics</Text>
          {metrics.map((metric, index) => (
            <View
              key={metric.name}
              style={[
                styles.metricRow,
                index === metrics.length - 1 && styles.lastMetricRow,
              ]}
            >
              <Text style={styles.metricName}>{metric.name}</Text>
              <View style={styles.metricValueContainer}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: getStatusColor(metric.status) },
                  ]}
                />
                <Text style={styles.metricValue}>{metric.value}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={runPerformanceTest}
          >
            <Ionicons name="speedometer" size={20} color="#3B82F6" />
            <Text style={styles.actionButtonText}>Run Performance Test</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={collectMetrics}
          >
            <Ionicons name="refresh" size={20} color="#3B82F6" />
            <Text style={styles.actionButtonText}>Refresh Metrics</Text>
          </TouchableOpacity>
        </View>

        {/* Last Updated */}
        <Text style={styles.lastUpdated}>
          Last updated: {lastUpdated.toLocaleTimeString()}
        </Text>

        {/* Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance Tips</Text>
          <View style={styles.tipContainer}>
            <Ionicons
              name="list"
              size={20}
              color="#3B82F6"
              style={styles.tipIcon}
            />
            <Text style={styles.tipText}>
              Use virtualized lists for large datasets to improve scrolling
              performance
            </Text>
          </View>
          <View style={styles.tipContainer}>
            <Ionicons
              name="image"
              size={20}
              color="#3B82F6"
              style={styles.tipIcon}
            />
            <Text style={styles.tipText}>
              Optimize images by using appropriate sizes and formats
            </Text>
          </View>
          <View style={styles.tipContainer}>
            <Ionicons
              name="code"
              size={20}
              color="#3B82F6"
              style={styles.tipIcon}
            />
            <Text style={styles.tipText}>
              Use memoization to prevent unnecessary re-renders
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  backButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  memoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  memoryBarContainer: {
    flex: 1,
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    overflow: 'hidden',
    marginRight: 12,
  },
  memoryBar: {
    height: '100%',
    borderRadius: 6,
  },
  memoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    width: 60,
    textAlign: 'right',
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  lastMetricRow: {
    borderBottomWidth: 0,
  },
  metricName: {
    fontSize: 15,
    color: '#374151',
  },
  metricValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
    marginLeft: 12,
  },
  lastUpdated: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  tipContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  tipIcon: {
    marginTop: 2,
    marginRight: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
});

export default PerformanceMonitorScreen;
