// @flow
/*
    Pillar Wallet: the personal data locker
    Copyright (C) 2019 Stiftung Pillar Project

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License along
    with this program; if not, write to the Free Software Foundation, Inc.,
    51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
*/
import * as React from 'react';
import styled, { withTheme } from 'styled-components/native';
import { StyleSheet } from 'react-native';
import Icon from 'components/Icon';
import { MediumText } from 'components/Typography';
import { fontSizes } from 'utils/variables';
import { getThemeColors, themedColors } from 'utils/themes';
import type { Theme } from 'models/Theme';

export type Props = {
  icon: string,
  color?: string,
  onPress?: Function,
  fontSize?: number,
  style?: StyleSheet.Styles,
  iconStyle?: StyleSheet.Styles,
  type?: string,
  margin?: number,
  iconText?: string,
  iconTextStyle?: StyleSheet.Styles,
  horizontalAlign?: string,
  theme: Theme,
  secondary?: boolean,
}

const IconButtonWrapper = styled.TouchableOpacity`
  justify-content: center;
  align-items: ${props => props.horizontalAlign ? props.horizontalAlign : 'center'};
  padding: 0;
`;

const ButtonText = styled(MediumText)`
  color: ${themedColors.primary};
  font-size: ${fontSizes.small}px;
`;

const IconButton = (props: Props) => {
  const {
    icon,
    onPress,
    fontSize,
    color,
    style,
    margin,
    type,
    iconText,
    iconTextStyle,
    iconStyle = {},
    horizontalAlign,
    secondary,
    theme,
  } = props;
  const colors = getThemeColors(theme);
  const iconColor = secondary ? colors.secondaryText : color;
  const iconParams = {
    active: false,
    name: icon,
    style: {
      paddingTop: 0,
      fontSize,
      color: iconColor,
      marginLeft: margin,
      marginRight: margin,
      marginTop: margin,
      marginBottom: margin,
      ...iconStyle,
    },
    type,
  };
  return (
    <IconButtonWrapper style={style} onPress={onPress} horizontalAlign={horizontalAlign}>
      <Icon {...iconParams} />
      {!!iconText && <ButtonText style={iconTextStyle}>{iconText}</ButtonText>}
    </IconButtonWrapper>
  );
};

export default withTheme(IconButton);
