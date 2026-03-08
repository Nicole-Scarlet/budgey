import React from 'react';
import { View } from 'react-native';

interface CircularProgressProps {
    size?: number;
    strokeWidth?: number;
    percentage?: number;
    color?: string;
    trackColor?: string;
    children?: React.ReactNode;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
    size = 64,
    strokeWidth = 6,
    percentage = 0,
    color = '#4ADE80',
    trackColor = '#334155',
    children,
}) => {
    const normalizedPercentage = Math.min(100, Math.max(0, percentage));

    // Calculate rotations for the two halves
    // Right side fills 0-50% (0 to 180 degrees)
    const rightRotation = Math.min(normalizedPercentage, 50) * 3.6;
    // Left side fills 50-100% (180 to 360 degrees)
    const leftRotation = Math.max(0, normalizedPercentage - 50) * 3.6;

    return (
        <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
            {/* Background Track */}
            <View style={{
                width: size,
                height: size,
                borderRadius: size / 2,
                borderWidth: strokeWidth,
                borderColor: trackColor,
                position: 'absolute',
            }} />

            {/* Right Half (0-50%) */}
            <View style={{
                position: 'absolute',
                left: size / 2,
                width: size / 2,
                height: size,
                overflow: 'hidden',
                zIndex: 1,
            }}>
                <View style={{
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    borderWidth: strokeWidth,
                    borderColor: color,
                    borderBottomColor: 'transparent',
                    borderLeftColor: 'transparent',
                    position: 'absolute',
                    left: -size / 2,
                    opacity: normalizedPercentage > 0 ? 1 : 0,
                    transform: [
                        { rotate: '45deg' },
                        { rotate: `${rightRotation - 180}deg` }
                    ],
                }} />
            </View>

            {/* Left Half (50-100%) */}
            <View style={{
                position: 'absolute',
                left: 0,
                width: size / 2,
                height: size,
                overflow: 'hidden',
                zIndex: normalizedPercentage > 50 ? 2 : 0,
            }}>
                <View style={{
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    borderWidth: strokeWidth,
                    borderColor: color,
                    borderTopColor: 'transparent',
                    borderRightColor: 'transparent',
                    position: 'absolute',
                    left: 0,
                    opacity: normalizedPercentage > 50 ? 1 : 0,
                    transform: [
                        { rotate: '45deg' },
                        { rotate: `${leftRotation - 180}deg` }
                    ],
                }} />
            </View>

            {/* Content Container */}
            <View style={{ position: 'absolute', zIndex: 10 }}>
                {children}
            </View>
        </View>
    );
};

export default CircularProgress;
