import { useLocalSearchParams } from "expo-router";
import ServiceDetailScreen from "../../src/screens/planning/ServiceDetail";

export default function Service() {
  const { id } = useLocalSearchParams();
  return <ServiceDetailScreen serviceId={id as string} />;
}
