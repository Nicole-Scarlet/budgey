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
    size = 60,
    strokeWidth = 4,
    percentage = 0,
    color = '#4ADE80',
    trackColor = 'rgba(241, 245, 249, 0.1)',
    children,
}) => {
    return (
        <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
            {/* Fake Track Circle */}
            <View
                style={{
                    position: 'absolute',
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    borderWidth: strokeWidth,
                    borderColor: trackColor
                }}
            />
            {/* Fake Progress Ring (Static fallback since SVG is removed) */}
            <View
                style={{
                    position: 'absolute',
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    borderWidth: strokeWidth,
                    borderColor: percentage > 0 ? color : 'transparent',
                    opacity: 0.5 // Just to show it differently
                }}
            />
            {/* Content Container */}
            <View style={{ position: 'absolute' }}>
                {children}
            </View>
        </View>
    );
};

export default CircularProgress;
