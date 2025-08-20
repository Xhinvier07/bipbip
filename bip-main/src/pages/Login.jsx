import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaGoogle, FaEnvelope, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import DotGrid from '../components/DotGrid';
import logoPath from '../assets/logo.png';
import bannerPath from '/banner_login.gif';
import bgLogin from '/bg_login.png';

const Login = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const { signIn, signUp, signInWithGoogle, user } = useAuth();
  
  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);
  
  const toggleForm = () => {
    setIsLogin(!isLogin);
    setError('');
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (isLogin) {
        // Login
        await signIn(email, password);
        if (onLogin) onLogin();
        navigate('/dashboard');
      } else {
        // Registration
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        await signUp(email, password);
        // Show success message or redirect
        setIsLogin(true);
        setError('Registration successful! Please check your email for verification.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
      // The redirect will happen automatically
    } catch (err) {
      setError(err.message || 'Error signing in with Google');
      setLoading(false);
    }
  };

  // Fixed animation variants for smooth sliding
  const containerVariants = {
    login: {
      flexDirection: "row",
      transition: { duration: 0.8, ease: [0.4, 0, 0.2, 1] }
    },
    register: {
      flexDirection: "row-reverse",
      transition: { duration: 0.8, ease: [0.4, 0, 0.2, 1] }
    }
  };

  const formVariants = {
    hidden: (direction) => ({
      x: direction === 'right' ? '100%' : '-100%',
      opacity: 1
    }),
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1]
      }
    },
    exit: (direction) => ({
      x: direction === 'right' ? '-100%' : '100%',
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1]
      }
    })
  };

  // Color scheme based on branding
  const colors = {
    primary: "#c95a94", // Pink
    secondary: "#bc7eff", // Purple
    accent: "#fea000", // Orange
    error: "#cf3d58", // Red
    text: "#2d3748", // Dark blue for text
    lightText: "#ffffff",
    background: "#f7fafc" // Light gray
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background image */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        backgroundColor: '#000000',
        backgroundImage: `url(${bgLogin})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}>
        {/* <DotGrid/> */}
      </div>
      
      <motion.div 
        style={{
          display: 'flex',
          width: '800px',
          maxWidth: '95%',
          height: '600px', // Reduced height
          overflow: 'hidden',
          borderRadius: '24px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          position: 'relative',
          zIndex: 1,
          backgroundColor: '#ffffff'
        }}
        variants={containerVariants}
        animate={isLogin ? "login" : "register"}
        ref={containerRef}
      >
        <AnimatePresence mode="wait">
          <motion.div 
            key={isLogin ? "brand-login" : "brand-register"}
            style={{
              width: '50%',
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
              color: colors.lightText,
              padding: 0,
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}
            custom={isLogin ? 'left' : 'right'}
            variants={formVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.img 
              src={bannerPath}
              alt="BipBip Login Banner" 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center'
              }}
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            />
          </motion.div>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.div 
            key={isLogin ? "form-login" : "form-register"}
            style={{
              width: '50%',
              backgroundColor: '#ffffff',
              position: 'relative',
              overflow: 'hidden'
            }}
            custom={isLogin ? 'right' : 'left'}
            variants={formVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              padding: '30px 25px',
              boxSizing: 'border-box'
            }}>
              <div style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  marginBottom: '10px'
                }}>
                  <img 
                    src={logoPath} 
                    alt="BipBip Logo" 
                    style={{
                      width: '45px',
                      height: '45px',
                      filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))'
                    }}
                  />
                </div>
                
                <h2 style={{
                  fontFamily: 'Fredoka, sans-serif',
                  textAlign: 'center',
                  color: colors.text,
                  marginTop: '5px',
                  marginBottom: '55px',
                  fontWeight: 600,
                  fontSize: '1.5rem'
                }}>
                  {isLogin ? 'Welcome Back!' : 'Create Account'}
                </h2>
                
                <form onSubmit={handleSubmit} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  flex: 1
                }}>
                  <motion.div 
                    style={{ position: 'relative' }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <FaEnvelope style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#888',
                      fontSize: '14px'
                    }} />
                    <input 
                      type="email" 
                      placeholder="Email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required 
                      style={{
                        width: '100%',
                        padding: '10px 10px 10px 36px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        backgroundColor: '#ffffff',
                        fontSize: '14px',
                        fontFamily: 'Inter, sans-serif',
                        boxSizing: 'border-box'
                      }}
                    />
                  </motion.div>
                  
                  {!isLogin && (
                    <motion.div 
                      style={{ position: 'relative' }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <FaUser style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#888',
                        fontSize: '14px'
                      }} />
                      <input 
                        type="text" 
                        placeholder="Username" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required 
                        style={{
                          width: '100%',
                          padding: '10px 10px 10px 36px',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                          backgroundColor: '#ffffff',
                          fontSize: '14px',
                          fontFamily: 'Inter, sans-serif',
                          boxSizing: 'border-box'
                        }}
                      />
                    </motion.div>
                  )}
                  
                  <motion.div 
                    style={{ position: 'relative' }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: isLogin ? 0.3 : 0.4 }}
                  >
                    <FaLock style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#888',
                      fontSize: '14px'
                    }} />
                    <input 
                      type={showPassword ? "text" : "password"}
                      placeholder="Password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required 
                      style={{
                        width: '100%',
                        padding: '10px 10px 10px 36px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        backgroundColor: '#ffffff',
                        fontSize: '14px',
                        fontFamily: 'Inter, sans-serif',
                        boxSizing: 'border-box'
                      }}
                    />
                    <div 
                      onClick={togglePasswordVisibility}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#888',
                        cursor: 'pointer'
                      }}
                    >
                      {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                    </div>
                  </motion.div>
                  
                  {!isLogin && (
                    <motion.div 
                      style={{ position: 'relative' }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <FaLock style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#888',
                        fontSize: '14px'
                      }} />
                      <input 
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm Password" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required 
                        style={{
                          width: '100%',
                          padding: '10px 10px 10px 36px',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                          backgroundColor: '#ffffff',
                          fontSize: '14px',
                          fontFamily: 'Inter, sans-serif',
                          boxSizing: 'border-box'
                        }}
                      />
                      <div 
                        onClick={toggleConfirmPasswordVisibility}
                        style={{
                          position: 'absolute',
                          right: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: '#888',
                          cursor: 'pointer'
                        }}
                      >
                        {showConfirmPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                      </div>
                    </motion.div>
                  )}
                  
                  {isLogin && (
                    <motion.div 
                      style={{ textAlign: 'right' }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      <a 
                        href="#"
                        style={{
                          color: colors.accent,
                          textDecoration: 'none',
                          fontSize: '12px',
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 500
                        }}
                      >
                        Forgot Password?
                      </a>
                    </motion.div>
                  )}
                  
                  {/* Error message */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '6px',
                        backgroundColor: error.includes('successful') ? '#d4edda' : '#f8d7da',
                        color: error.includes('successful') ? '#155724' : '#721c24',
                        fontSize: '13px',
                        marginBottom: '10px'
                      }}
                    >
                      {error}
                    </motion.div>
                  )}
                
                  <motion.button 
                    type="submit"
                    disabled={loading}
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.02 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: isLogin ? 0.5 : 0.6 }}
                    style={{
                      background: `linear-gradient(135deg, ${colors.accent}, ${colors.error})`,
                      color: 'white',
                      border: 'none',
                      padding: '12px',
                      borderRadius: '8px',
                      fontWeight: 600,
                      fontSize: '14px',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      fontFamily: 'Inter, sans-serif',
                      marginTop: '5px',
                      opacity: loading ? 0.7 : 1
                    }}
                  >
                    {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
                  </motion.button>
                  
                  <motion.div 
                    style={{
                      marginTop: '10px',
                      textAlign: 'center'
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: isLogin ? 0.6 : 0.7 }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      margin: '5px 0',
                      fontSize: '12px',
                      color: '#888'
                    }}>
                      <div style={{
                        flex: 1,
                        height: '1px',
                        backgroundColor: '#e0e0e0'
                      }}></div>
                      <span style={{
                        margin: '0 10px',
                        whiteSpace: 'nowrap',
                        fontFamily: 'Inter, sans-serif'
                      }}>
                        or continue with
                      </span>
                      <div style={{
                        flex: 1,
                        height: '1px',
                        backgroundColor: '#e0e0e0'
                      }}></div>
                    </div>
                  
                    <motion.button 
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={loading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        width: '100%',
                        padding: '10px 0',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        backgroundColor: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '13px',
                        fontWeight: 500,
                        color: '#3c4043',
                        marginTop: '10px',
                        opacity: loading ? 0.7 : 1
                      }}
                    >
                      <FaGoogle style={{ color: '#DB4437', marginRight: '10px' }} />
                      Sign in with Google
                    </motion.button>
                  </motion.div>
                  
                  <motion.div 
                    style={{
                      marginTop: '15px',
                      textAlign: 'center'
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: isLogin ? 0.7 : 0.8 }}
                  >
                    <p style={{
                      color: '#888',
                      fontSize: '13px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'Inter, sans-serif',
                      margin: 0
                    }}>
                      {isLogin ? "Don't have an account?" : "Already have an account?"}
                      <motion.button 
                        type="button"
                        onClick={toggleForm}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: colors.accent,
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 600,
                          fontSize: '13px',
                          cursor: 'pointer',
                          padding: 0,
                          marginLeft: '5px'
                        }}
                      >
                        {isLogin ? 'Sign Up' : 'Login'}
                      </motion.button>
                    </p>
                  </motion.div>
                </form>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Login;