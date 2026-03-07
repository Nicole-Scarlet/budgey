import React, { useState } from 'react';
import { Modal, View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CalendarModalProps {
    visible: boolean;
    onClose: () => void;
    onSelectDate: (date: string) => void;
    currentDate?: string;
}

const { width } = Dimensions.get('window');

const CalendarModal: React.FC<CalendarModalProps> = ({ visible, onClose, onSelectDate, currentDate }) => {
    const today = new Date();
    const initialDate = currentDate ? new Date(currentDate.replace(/\s/g, '')) : today;

    const [viewDate, setViewDate] = useState(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));
    const [selectedDate, setSelectedDate] = useState(initialDate);

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const daysInMonth = (month: number, year: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const firstDayOfMonth = (month: number, year: number) => {
        return new Date(year, month, 1).getDay();
    };

    const handlePrevMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    };

    const handleSelectDay = (day: number) => {
        const newSelected = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        setSelectedDate(newSelected);

        // Format as YYYY - MM - DD
        const y = newSelected.getFullYear();
        const m = String(newSelected.getMonth() + 1).padStart(2, '0');
        const d = String(newSelected.getDate()).padStart(2, '0');
        onSelectDate(`${y} - ${m} - ${d}`);
        onClose();
    };

    const renderHeader = () => (
        <View className="flex-row justify-between items-center mb-6">
            <Pressable onPress={handlePrevMonth} className="p-2">
                <Ionicons name="chevron-back" size={24} color="white" />
            </Pressable>
            <View className="items-center">
                <Text className="text-white text-xl font-bold">{months[viewDate.getMonth()]}</Text>
                <Text className="text-slate-400 text-sm">{viewDate.getFullYear()}</Text>
            </View>
            <Pressable onPress={handleNextMonth} className="p-2">
                <Ionicons name="chevron-forward" size={24} color="white" />
            </Pressable>
        </View>
    );

    const renderDaysHeader = () => (
        <View className="flex-row mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                <View key={index} className="flex-1 items-center">
                    <Text className="text-slate-500 font-bold text-xs">{day}</Text>
                </View>
            ))}
        </View>
    );

    const renderCalendar = () => {
        const totalDays = daysInMonth(viewDate.getMonth(), viewDate.getFullYear());
        const startDay = firstDayOfMonth(viewDate.getMonth(), viewDate.getFullYear());
        const weeks: React.ReactNode[] = [];
        let days: React.ReactNode[] = [];

        // Padding for previous month
        for (let i = 0; i < startDay; i++) {
            days.push(<View key={`empty-${i}`} className="flex-1 aspect-square" />);
        }

        for (let i = 1; i <= totalDays; i++) {
            const isSelected = selectedDate.getDate() === i &&
                selectedDate.getMonth() === viewDate.getMonth() &&
                selectedDate.getFullYear() === viewDate.getFullYear();

            const isToday = today.getDate() === i &&
                today.getMonth() === viewDate.getMonth() &&
                today.getFullYear() === viewDate.getFullYear();

            days.push(
                <Pressable
                    key={i}
                    onPress={() => handleSelectDay(i)}
                    className={`flex-1 aspect-square items-center justify-center rounded-full m-1 ${isSelected ? 'bg-[#6366F1]' : ''}`}
                >
                    <Text className={`font-bold ${isSelected ? 'text-white' : isToday ? 'text-[#6366F1]' : 'text-slate-200'}`}>
                        {i}
                    </Text>
                </Pressable>
            );

            if ((days.length) % 7 === 0) {
                weeks.push(<View key={`week-${weeks.length}`} className="flex-row">{days}</View>);
                days = [];
            }
        }

        // Fill remaining days
        if (days.length > 0) {
            while (days.length < 7) {
                days.push(<View key={`empty-end-${days.length}`} className="flex-1 aspect-square" />);
            }
            weeks.push(<View key={`week-${weeks.length}`} className="flex-row">{days}</View>);
        }

        return weeks;
    };

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <Pressable
                onPress={onClose}
                className="flex-1 bg-black/60 items-center justify-center px-6"
            >
                <Pressable onPress={(e) => e.stopPropagation()} className="w-full bg-[#1E293B] rounded-[32px] p-6 border border-[#90A1B9]/20 shadow-2xl">
                    {renderHeader()}
                    {renderDaysHeader()}
                    <View className="mt-2">
                        {renderCalendar()}
                    </View>

                    <Pressable
                        onPress={onClose}
                        className="mt-6 bg-[#334155] py-4 rounded-2xl items-center border border-[#90A1B9]/20"
                    >
                        <Text className="text-white font-bold">Close</Text>
                    </Pressable>
                </Pressable>
            </Pressable>
        </Modal>
    );
};

export default CalendarModal;
