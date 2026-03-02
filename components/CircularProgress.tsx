import React from 'react';
import { View, StyleSheet } from 'react-native';

interface CircularProgressProps {
    size: number;
    strokeWidth: number;
    percentage: number;
    color: string;
    children?: React.ReactNode;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
    size,
    strokeWidth,
    percentage,
    color,
    children,
}) => {
    const radius = size / 2;
    const innerSize = size - strokeWidth * 2;

    // Simple view-based circular progress for environments without react-native-svg
    // This uses a rotation trick with two semi-circular halves
    const renderHalf = (isLeft: boolean) => {
        const rotation = isLeft
            ? Math.min(Math.max((percentage - 50) * 3.6, 0), 180)
            : Math.min(Math.max(percentage * 3.6, 0), 180);

        return (
            <View
                style={[
                    styles.halfContainer,
                    {
                        width: radius,
                        height: size,
                        left: isLeft ? 0 : radius,
                        overflow: 'hidden',
                    },
                ]}
            >
                <View
                    style={[
                        styles.halfCircle,
                        {
                            width: size,
                            height: size,
                            borderRadius: radius,
                            borderWidth: strokeWidth,
                            borderColor: color,
                            left: isLeft ? 0 : -radius,
                            transform: [{ rotate: `${isLeft ? rotation : rotation}deg` }],
                        },
                    ]}
                />
            </View>
        );
    };

    return (
        <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
            {/* Background Circle */}
            <View
                style={{
                    position: 'absolute',
                    width: size,
                    height: size,
                    borderRadius: radius,
                    borderWidth: strokeWidth,
                    borderColor: '#90A1B930', // Faded border color from home.tsx
                }}
            />

            {/* Progress Circles (Simplified for demo, usually requires SVG for perfect arcs) */}
            {/* Note: This is a placeholder for a more robust SVG implementation if dependencies were available */}
            <View
                style={{
                    position: 'absolute',
                    width: size,
                    height: size,
                    borderRadius: radius,
                    borderWidth: strokeWidth,
                    borderColor: color,
                    opacity: 0.3, // Just to show something for now if SVG is missing
                }}
            />

            {children && (
                <View style={{ width: innerSize, height: innerSize, alignItems: 'center', justifyContent: 'center' }}>
                    {children}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    halfContainer: {
        position: 'absolute',
        top: 0,
    },
    halfCircle: {
        position: 'absolute',
        top: 0,
        borderBottomColor: 'transparent',
        borderLeftColor: 'transparent',
    },
});

export default CircularProgress;
