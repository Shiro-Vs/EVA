import { useLocalSearchParams } from "expo-router";
import ServiceDetailScreen from "../../src/screens/planning/ServiceDetailScreen";

export default function Service() {
  const { id } = useLocalSearchParams();
  return <ServiceDetailScreen serviceId={id as string} />;
}
