import React from 'react';
import { Modal, View, Text, Pressable, Platform, StyleSheet, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

interface CalendarModalProps {
    visible: boolean;
    onClose: () => void;
    onSelectDate: (date: Date) => void;
    currentDate?: Date;
    title?: string;
}

const CalendarModal: React.FC<CalendarModalProps> = ({ 
    visible, 
    onClose, 
    onSelectDate, 
    currentDate,
    title = "Select Date"
}) => {
    const [tempDate, setTempDate] = React.useState(new Date());
    const { colors, isDark } = useTheme();

    React.useEffect(() => {
        if (currentDate) {
            setTempDate(currentDate);
        } else {
            setTempDate(new Date());
        }
    }, [visible, currentDate]);

    const onChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            if (event.type === 'set' && selectedDate) {
                onSelectDate(selectedDate);
                onClose();
            } else if (event.type === 'dismissed') {
                onClose();
            }
        } else {
            if (selectedDate) {
                setTempDate(selectedDate);
            }
        }
    };

    const handleConfirmIOS = () => {
        onSelectDate(tempDate);
        onClose();
    };

    if (Platform.OS === 'android' && visible) {
        return (
            <DateTimePicker
                value={tempDate}
                mode="date"
                display="default"
                onChange={onChange}
            />
        );
    }

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <Pressable
                style={styles.overlay}
                onPress={onClose}
            >
                <Pressable style={styles.content} onPress={(e) => e.stopPropagation()}>
                    <View 
                        style={{ backgroundColor: colors.background, borderColor: colors.border + '33' }}
                        className="rounded-[30px] p-6 border shadow-2xl"
                    >
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-xl font-bold" style={{ color: colors.foreground }}>{title}</Text>
                            <Pressable onPress={onClose} className="p-1">
                                <Ionicons name="close" size={24} color={colors.muted} />
                            </Pressable>
                        </View>

                        <View 
                            style={{ backgroundColor: colors.card + '4D' }}
                            className="rounded-2xl p-4"
                        >
                            <DateTimePicker
                                value={tempDate}
                                mode="date"
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={onChange}
                                textColor={colors.foreground}
                                themeVariant={isDark ? "dark" : "light"}
                            />
                        </View>

                        {Platform.OS === 'ios' && (
                            <TouchableOpacity
                                onPress={handleConfirmIOS}
                                activeOpacity={0.8}
                                className="mt-8 bg-[#38BDF8] py-4 rounded-2xl items-center justify-center shadow-lg"
                            >
                                <Text className="text-[#0F172A] font-bold text-lg uppercase tracking-widest">Confirm Date</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        padding: 24,
    },
    content: {
        width: '100%',
    }
});

export default CalendarModal;
