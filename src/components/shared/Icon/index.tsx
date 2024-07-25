import Box from "./Box";
import Cloth from "./Cloth";
import Home from "./Home";
import My from "./My";

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  outline?: boolean;
}

const Icons = {
  Home: (props: IconProps) => <Home {...props} />,
  Cloth: (props: IconProps) => <Cloth {...props} />,
  Box: (props: IconProps) => <Box {...props} />,
  My: (props: IconProps) => <My {...props} />,
};

export default Icons;
