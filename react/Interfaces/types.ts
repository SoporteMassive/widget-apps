export interface Schedule {
  id: number;
  label: string;
  start: string;
  end: string;
  active: boolean;
}

export interface TimeZone {
  id: number;
  identifier: string;
  offset_hours: string;
  country_name: string;
  offset_gmt: string;
}

export interface TimeZoneOption {
  value: TimeZone;
  label: string;
}

export interface Widget {
  id: number;
  time_zone_id: number;
  button_title: string;
  header_title: string;
  header_subtitle: string;
  button_color: string;
  header_color: string;
  position: Position;
  options: Option[];
  schedules?: Schedule[];
}

export interface Option {
  id: number | string;
  order: number;
  title: string;
  message: string;
  mobile_phone?: string;
  predefined_message?: string;
  queue?: number;
  background_color: string;
  type: string;
  font_color: string;
  image?: any;
  active: boolean;
}

export interface PositionDetails {
  type: string;
  value: string;
  active: boolean;
  position: string;
}

export interface Position {
  id: number;
  desktop: PositionDetails[];
  mobile: PositionDetails[];
}

export interface Color {
  rgba: Rgba;
  hsva: Hsva;
  hex: string;
}

export interface Hsva {
  h: number;
  s: number;
  v: number;
  a: number;
}

export interface Rgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface TypeOption {
  value: string;
  label: string;
}

export interface TimeZone {
  id: number;
  name: string;
}

export interface TimeZoneOption {
  value: TimeZone;
  label: string;
}

export interface Schedule {
  id: number;
  start_time: string;
  end_time: string;
  active: boolean;
  day_name: string;
}

export interface OptionsList {
  value: number;
  label: string;
}

export interface TypeWidget {
  value: string;
  label: string;
}
