import { createGlobalStyle } from 'styled-components';
import FletcherGothicFLF from '../assets/fonts/Fletchergothicflf-VGqB.ttf';
import NiramitBold from '../assets/fonts/Niramit-Bold.ttf';
import NiramitBoldItalic from '../assets/fonts/Niramit-BoldItalic.ttf';
import NiramitExtraLight from '../assets/fonts/Niramit-ExtraLight.ttf';
import NiramitExtraLightItalic from '../assets/fonts/Niramit-ExtraLightItalic.ttf';
import NiramitItalic from '../assets/fonts/Niramit-Italic.ttf';
import NiramitLight from '../assets/fonts/Niramit-Light.ttf';
import NiramitLightItalic from '../assets/fonts/Niramit-LightItalic.ttf';
import NiramitMedium from '../assets/fonts/Niramit-Medium.ttf';
import NiramitMediumItalic from '../assets/fonts/Niramit-MediumItalic.ttf';
import NiramitRegular from '../assets/fonts/Niramit-Regular.ttf';
import NiramitSemiBold from '../assets/fonts/Niramit-SemiBold.ttf';
import NiramitSemiBoldItalic from '../assets/fonts/Niramit-SemiBoldItalic.ttf';

export default createGlobalStyle`
  @font-face {
    font-family: 'FletcherGothicFLF';
    src: url(${FletcherGothicFLF}) format('truetype');
    font-style: normal;
  }

  @font-face {
    font-family: 'NiramitBold';
    src: url(${NiramitBold}) format('truetype');
    font-weight: 700;
    font-style: normal;
  }

  @font-face {
    font-family: 'NiramitBoldItalic';
    src: url(${NiramitBoldItalic}) format('truetype');
    font-weight: 700;
    font-style: italic;
  }

  @font-face {
    font-family: 'NiramitExtraLight';
    src: url(${NiramitExtraLight}) format('truetype');
    font-weight: 200;
    font-style: normal;
  }

  @font-face {
    font-family: 'NiramitExtraLightItalic';
    src: url(${NiramitExtraLightItalic}) format('truetype');
    font-weight: 200;
    font-style: italic;
  }

  @font-face {
    font-family: 'NiramitItalic';
    src: url(${NiramitItalic}) format('truetype');
    font-weight: 400;
    font-style: italic;
  }

  @font-face {
    font-family: 'NiramitLight';
    src: url(${NiramitLight}) format('truetype');
    font-weight: 300;
    font-style: normal;
  }

  @font-face {
    font-family: 'NiramitLightItalic';
    src: url(${NiramitLightItalic}) format('truetype');
    font-weight: 300;
    font-style: italic;
  }

  @font-face {
    font-family: 'NiramitMedium';
    src: url(${NiramitMedium}) format('truetype');
    font-weight: 500;
    font-style: normal;
  }

  @font-face {
    font-family: 'NiramitMediumItalic';
    src: url(${NiramitMediumItalic}) format('truetype');
    font-weight: 500;
    font-style: italic;
  }

  @font-face {
    font-family: 'NiramitRegular';
    src: url(${NiramitRegular}) format('truetype');
    font-weight: 400;
    font-style: normal;
  }

  @font-face {
    font-family: 'NiramitSemiBold';
    src: url(${NiramitSemiBold}) format('truetype');
    font-weight: 600;
    font-style: normal;
  }

  @font-face {
    font-family: 'NiramitSemiBoldItalic';
    src: url(${NiramitSemiBoldItalic}) format('truetype');
    font-weight: 600;
    font-style: italic;
  }

  * {
    margin: 0;
    padding: 0;
    outline: 0;
    box-sizing: border-box;
    font-family: NiramitRegular;
    font-size: 36px;
    line-height: 46.8px;
    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.primaryText};
  }

  #root {
    margin: 0 auto;
  }
`;
