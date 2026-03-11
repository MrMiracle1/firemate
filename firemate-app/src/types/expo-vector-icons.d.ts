// @expo/vector-icons 类型声明
declare module '@expo/vector-icons' {
  import { Component } from 'react';
  import { TextProps } from 'react-native';

  export interface IconProps extends TextProps {
    name: string;
    size?: number;
    color?: string;
  }

  export class Ionicons extends Component<IconProps> {
    static glyphMap: Record<string, number>;
  }

  export class MaterialIcons extends Component<IconProps> {
    static glyphMap: Record<string, number>;
  }

  export class FontAwesome extends Component<IconProps> {
    static glyphMap: Record<string, number>;
  }

  export default {
    Ionicons,
    MaterialIcons,
    FontAwesome,
  };
}
