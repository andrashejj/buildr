import { ExportType, useRoomPlan } from 'expo-roomplan';
import { Text, View } from 'react-native';

export default function Index() {
  const { startRoomPlan } = useRoomPlan({
    exportType: ExportType.Parametric,
    sendFileLoc: false,
  });
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text>Edit app/index.tsx to edit this screen.</Text>
    </View>
  );
}
