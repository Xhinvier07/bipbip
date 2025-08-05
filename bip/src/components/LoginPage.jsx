import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Card, 
  CardBody, 
  Input, 
  Text, 
  VStack, 
  HStack, 
  Divider, 
  Link,
  Heading,
  Flex,
  Image,
  InputGroup,
  InputLeftElement,
  useColorModeValue
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, Mail } from 'lucide-react';

const MotionCard = motion(Card);
const MotionBox = motion(Box);

function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const bgColor = useColorModeValue('#E6E6FA', '#1A1A2E');
  const cardBg = useColorModeValue('white', '#16213E');
  const textColor = useColorModeValue('#4B0082', '#E6E6FA');
  const accentColor = '#FFD700';
  const purpleColor = '#8A2BE2';

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
  };

  const cardVariants = {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 }
  };

  const logoCardVariants = {
    initial: { opacity: 1, x: 0 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 100 }
  };

  return (
    <Box
      minH="100vh"
      bg={`linear-gradient(135deg, ${bgColor} 0%, #DA70D6 100%)`}
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
    >
      <Flex
        direction="row"
        gap={6}
        align="center"
        justify="center"
        maxW="900px"
        w="full"
      >
        <AnimatePresence mode="wait">
          {!isSignUp ? (
            <MotionCard
              key="logo-card"
              variants={logoCardVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.5, ease: "easeInOut" }}
              bg={cardBg}
              shadow="2xl"
              borderRadius="2xl"
              p={8}
              minH="500px"
              w="350px"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <VStack spacing={6} textAlign="center">
                <MotionBox
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <Box
                    w="120px"
                    h="120px"
                    bg={`linear-gradient(45deg, ${purpleColor}, ${accentColor})`}
                    borderRadius="50%"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    shadow="lg"
                    p={2}
                  >
                    <Image 
                      src="/bip-logo.png" 
                      alt="BIPBIP Logo" 
                      w="80px" 
                      h="80px" 
                      objectFit="contain"
                      fallback={
                        <Text fontSize="4xl" fontWeight="bold" color="white">
                          🦋
                        </Text>
                      }
                    />
                  </Box>
                </MotionBox>
                <Heading
                  size="2xl"
                  color={textColor}
                  fontFamily="'Fredoka', cursive"
                  letterSpacing="wider"
                >
                  BIPBIP
                </Heading>
                <Text
                  fontSize="lg"
                  color={textColor}
                  opacity={0.8}
                  fontWeight="500"
                  textAlign="center"
                  maxW="280px"
                >
                  Transform your ideas into beautiful digital experiences
                </Text>
              </VStack>
            </MotionCard>
          ) : (
            <MotionCard
              key="signup-form-left"
              variants={cardVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.5, ease: "easeInOut" }}
              bg={cardBg}
              shadow="2xl"
              borderRadius="2xl"
              p={8}
              minH="500px"
              w="350px"
            >
              <CardBody p={0}>
                <VStack spacing={4} align="stretch">
                  <VStack spacing={3} mb={4}>
                    <Box
                      w="60px"
                      h="60px"
                      bg={`linear-gradient(45deg, ${purpleColor}, ${accentColor})`}
                      borderRadius="50%"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      p={1}
                    >
                      <Image 
                        src="/bip-logo.png" 
                        alt="BIPBIP Logo" 
                        w="40px" 
                        h="40px" 
                        objectFit="contain"
                        fallback={<Text fontSize="2xl" color="white">🦋</Text>}
                      />
                    </Box>
                    <Heading size="lg" color={textColor} fontFamily="'Fredoka', cursive">
                      Create Account
                    </Heading>
                  </VStack>

                  <InputGroup>
                    <InputLeftElement>
                      <User color={purpleColor} size={20} />
                    </InputLeftElement>
                    <Input
                      name="username"
                      placeholder="Username"
                      value={formData.username}
                      onChange={handleInputChange}
                      borderColor={purpleColor}
                      _focus={{ borderColor: accentColor, boxShadow: `0 0 0 1px ${accentColor}` }}
                    />
                  </InputGroup>

                  <InputGroup>
                    <InputLeftElement>
                      <Mail color={purpleColor} size={20} />
                    </InputLeftElement>
                    <Input
                      name="email"
                      type="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={handleInputChange}
                      borderColor={purpleColor}
                      _focus={{ borderColor: accentColor, boxShadow: `0 0 0 1px ${accentColor}` }}
                    />
                  </InputGroup>

                  <InputGroup>
                    <InputLeftElement>
                      <Lock color={purpleColor} size={20} />
                    </InputLeftElement>
                    <Input
                      name="password"
                      type="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleInputChange}
                      borderColor={purpleColor}
                      _focus={{ borderColor: accentColor, boxShadow: `0 0 0 1px ${accentColor}` }}
                    />
                  </InputGroup>

                  <InputGroup>
                    <InputLeftElement>
                      <Lock color={purpleColor} size={20} />
                    </InputLeftElement>
                    <Input
                      name="confirmPassword"
                      type="password"
                      placeholder="Confirm Password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      borderColor={purpleColor}
                      _focus={{ borderColor: accentColor, boxShadow: `0 0 0 1px ${accentColor}` }}
                    />
                  </InputGroup>

                  <Button
                    bg={`linear-gradient(45deg, ${purpleColor}, ${accentColor})`}
                    color="white"
                    size="lg"
                    _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
                    transition="all 0.3s"
                  >
                    Create Account
                  </Button>

                  <Text textAlign="center" color={textColor} opacity={0.7}>
                    Already have an account?{' '}
                    <Link color={accentColor} fontWeight="bold" onClick={toggleMode} cursor="pointer">
                      Sign In
                    </Link>
                  </Text>
                </VStack>
              </CardBody>
            </MotionCard>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <MotionCard
            key={isSignUp ? "logo-card-right" : "login-form"}
            variants={cardVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.5, ease: "easeInOut" }}
            bg={cardBg}
            shadow="2xl"
            borderRadius="2xl"
            p={8}
            minH="500px"
            w="350px"
          >
            <CardBody p={0}>
              {isSignUp ? (
                <VStack spacing={6} textAlign="center" justify="center" h="full">
                  <MotionBox
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Box
                      w="120px"
                      h="120px"
                      bg={`linear-gradient(45deg, ${purpleColor}, ${accentColor})`}
                      borderRadius="50%"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      shadow="lg"
                      p={2}
                    >
                      <Image 
                        src="/bip-logo.png" 
                        alt="BIPBIP Logo" 
                        w="80px" 
                        h="80px" 
                        objectFit="contain"
                        fallback={
                          <Text fontSize="4xl" fontWeight="bold" color="white">
                            🦋
                          </Text>
                        }
                      />
                    </Box>
                  </MotionBox>
                  <Heading
                    size="2xl"
                    color={textColor}
                    fontFamily="'Fredoka', cursive"
                    letterSpacing="wider"
                  >
                    BIPBIP
                  </Heading>
                  <Text
                    fontSize="lg"
                    color={textColor}
                    opacity={0.8}
                    fontWeight="500"
                    textAlign="center"
                    maxW="280px"
                  >
                    Welcome to our community! Create your account to get started.
                  </Text>
                </VStack>
              ) : (
                <VStack spacing={4} align="stretch">
                  <VStack spacing={3} mb={4}>
                    <Box
                      w="60px"
                      h="60px"
                      bg={`linear-gradient(45deg, ${purpleColor}, ${accentColor})`}
                      borderRadius="50%"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      p={1}
                    >
                      <Image 
                        src="/bip-logo.png" 
                        alt="BIPBIP Logo" 
                        w="40px" 
                        h="40px" 
                        objectFit="contain"
                        fallback={<Text fontSize="2xl" color="white">🦋</Text>}
                      />
                    </Box>
                    <Heading size="lg" color={textColor} fontFamily="'Fredoka', cursive">
                      Welcome Back
                    </Heading>
                  </VStack>

                  <InputGroup>
                    <InputLeftElement>
                      <User color={purpleColor} size={20} />
                    </InputLeftElement>
                    <Input
                      name="username"
                      placeholder="Username"
                      value={formData.username}
                      onChange={handleInputChange}
                      borderColor={purpleColor}
                      _focus={{ borderColor: accentColor, boxShadow: `0 0 0 1px ${accentColor}` }}
                    />
                  </InputGroup>

                  <InputGroup>
                    <InputLeftElement>
                      <Lock color={purpleColor} size={20} />
                    </InputLeftElement>
                    <Input
                      name="password"
                      type="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleInputChange}
                      borderColor={purpleColor}
                      _focus={{ borderColor: accentColor, boxShadow: `0 0 0 1px ${accentColor}` }}
                    />
                  </InputGroup>

                  <Button
                    bg={`linear-gradient(45deg, ${purpleColor}, ${accentColor})`}
                    color="white"
                    size="lg"
                    _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
                    transition="all 0.3s"
                  >
                    Sign In
                  </Button>

                  <VStack spacing={3}>
                    <HStack w="full">
                      <Divider borderColor={purpleColor} opacity={0.3} />
                      <Text fontSize="sm" color={textColor} opacity={0.7} whiteSpace="nowrap">
                        Or login using
                      </Text>
                      <Divider borderColor={purpleColor} opacity={0.3} />
                    </HStack>

                    <Button
                      variant="outline"
                      borderColor={purpleColor}
                      color={purpleColor}
                      _hover={{ bg: purpleColor, color: 'white' }}
                      w="full"
                    >
                      Continue with Google
                    </Button>
                  </VStack>

                  <VStack spacing={2} mt={4}>
                    <Link color={accentColor} fontSize="sm" fontWeight="500">
                      Forgot Password?
                    </Link>
                    <Text textAlign="center" color={textColor} opacity={0.7} fontSize="sm">
                      Don't have an account?{' '}
                      <Link color={accentColor} fontWeight="bold" onClick={toggleMode} cursor="pointer">
                        Sign Up
                      </Link>
                    </Text>
                  </VStack>
                </VStack>
              )}
            </CardBody>
          </MotionCard>
        </AnimatePresence>
      </Flex>
    </Box>
  );
}

export default LoginPage;