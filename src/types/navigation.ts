
export type HomeStackParamList = {
  HomeMain: undefined;
  HomeDetail: { id: string };
};

// Users Stack
export type UsersStackParamList = {
  UsersMain: undefined;
  UsersDetail: { userId: string };
};

// Settings Stack
export type SettingsStackParamList = {
  SettingsMain: undefined;
  SettingsDetail: { id: string };
  DeviceManagement: undefined;
  AddNewDevice: undefined;
  Provisioning: undefined;
};

// Activity Stack
export type ActivityStackParamList = {
  ActivityMain: undefined;
  ActivityDetail: { id: string };
};

// Main Tab Navigator
export type MainTabParamList = {
  Home: undefined;
  Users: undefined;
  Activity: undefined;
  Settings: undefined;
};
