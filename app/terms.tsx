import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as React from "react";
import {
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TermsPage = () => {
    const router = useRouter();

    const Section = ({ title, content }: { title: string, content: string }) => (
        <View className="mb-8">
            <Text className="text-white text-lg font-bold mb-3">{title}</Text>
            <Text className="text-slate-400 text-base leading-6 text-justify">
                {content}
            </Text>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-[#1E293B]">
            {/* Header */}
            <View className="flex-row items-center justify-between px-6 py-4">
                <Pressable
                    onPress={() => router.back()}
                    className="w-10 h-10 bg-[#334155] rounded-full items-center justify-center border border-[#90A1B9]"
                >
                    <Ionicons name="chevron-back" size={24} color="white" />
                </Pressable>
                <Text className="text-white text-xl font-bold">Terms & Conditions</Text>
                <View className="w-10" />
            </View>

            <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
                <View className="mt-6 mb-10">
                    <Text className="text-slate-500 text-sm mb-2">Last Updated: March 1, 2026</Text>
                    <Text className="text-white text-2xl font-black">Agreement to Terms</Text>
                    <View className="h-1 w-12 bg-[#90A1B9] mt-4 rounded-full" />
                </View>

                <Section
                    title="1. Acceptance of Terms"
                    content="By accessing or using the Budgey application, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you must not use our services. These terms apply to all visitors, users, and others who access or use the Service."
                />

                <Section
                    title="2. AI Financial Insights Disclaimer"
                    content="Budgey utilizes artificial intelligence (AI) to provide financial analysis, savings recommendations, and behavioral insights. These outputs are for informational and educational purposes only. They DO NOT constitute professional financial, investment, or legal advice. You are solely responsible for all financial decisions you make."
                />

                <Section
                    title="3. User Accounts & Security"
                    content="When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password. You agree not to disclose your password to any third party."
                />

                <Section
                    title="4. Data Collection & Privacy"
                    content="Your privacy is important to us. Budgey collects financial data, including expenses, budgets, and receipt images, to provide its core services. By using our OCR (Optical Character Recognition) and AI features, you grant us permission to process this data. For full details on our data practices, please review our Privacy Policy."
                />

                <Section
                    title="5. Multi-Person & Shared Budgeting"
                    content="If you use the 'Multi-Person Budgeting' features, you acknowledge that shared financial data will be visible to designated partners or family members. Budgey is not responsible for any disputes or misuse of data occurring within your shared financial context."
                />

                <Section
                    title="6. Limitation of Liability"
                    content="In no event shall Budgey, nor its directors or employees, be liable for any indirect, incidental, or consequential damages resulting from your use of the service, including but not limited to financial losses, data inaccuracies in AI parsing, or system downtime."
                />

                <Section
                    title="7. Termination"
                    content="We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms."
                />

                <Section
                    title="8. Governing Law"
                    content="These Terms shall be governed and construed in accordance with the laws of the jurisdiction in which Budgey operates, without regard to its conflict of law provisions."
                />

                <View className="mt-4 pt-8 border-t border-[#90A1B9]/20">
                    <Text className="text-slate-500 text-sm text-center italic">
                        If you have any questions about these Terms, please contact support through the Help & Support page.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default TermsPage;
