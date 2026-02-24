import { StyleSheet, Text, View } from "react-native";

const WelcomePage = () => {

    return (
        <View style={styles.welcomePage}>
            <View style={[styles.welcomePageChild, styles.welcomePosition]} />
            <View style={[styles.welcomePageItem, styles.welcomePosition]} />
            <Text style={[styles.getStarted, styles.getStartedFlexBox]}>Get Started</Text>
            <Text style={styles.knowYourselfAnd}>Know yourself (and your wallet) better using our state-of-the-art features that will help you understand that budgeting does not have to be difficult.{'\n'}</Text>
            <Text style={[styles.welcomeToBudgey, styles.getStartedFlexBox]}>Welcome to Budgey!</Text>
        </View>);
};

const styles = StyleSheet.create({
    welcomePosition: {
        borderRadius: 25,
        position: "absolute",
        left: "50%"
    },
    getStartedFlexBox: {
        textAlign: "left",
        color: "#fff",
        position: "absolute"
    },
    welcomePage: {
        width: "100%",
        height: 917,
        backgroundColor: "#1e293b",
        borderStyle: "solid",
        borderColor: "#000",
        borderWidth: 1,
        overflow: "hidden"
    },
    welcomePageChild: {
        marginLeft: -174,
        top: 73,
        width: 347,
        height: 363
    },
    welcomePageItem: {
        marginLeft: -177,
        top: 719,
        backgroundColor: "#94a3b8",
        width: 354,
        height: 70
    },
    getStarted: {
        top: 738,
        left: 138,
        fontSize: 24,
        fontWeight: "600",
        fontFamily: "OpenSans-SemiBold"
    },
    knowYourselfAnd: {
        marginLeft: -166,
        top: 551,
        fontSize: 20,
        fontFamily: "OpenSans-Regular",
        textAlign: "center",
        width: 339,
        height: 110,
        color: "#fff",
        left: "50%",
        position: "absolute"
    },
    welcomeToBudgey: {
        marginLeft: -157,
        top: 494,
        fontSize: 32,
        fontWeight: "700",
        fontFamily: "OpenSans-Bold",
        width: 326,
        height: 37,
        left: "50%",
        textAlign: "left"
    }
});

export default WelcomePage;
