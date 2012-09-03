<?php
class Session
{
    private $_loginState;

    const CONNECTED = 1;
    const NOT_CONNECTED = 0;

    public function __construct()
    {
        if (!isset($_SESSION)) {
            session_start();
        }
    }

    protected function login($username,$userid)
    {
        $_SESSION['valid'] = True;
        $_SESSION['username'] = $username;
        $_SESSION['userid'] = $userid;
        $_SESSION['LAST_ACTIVITY'] = time();
        $this->_loginState = Session::CONNECTED;
    }

    public function isLogged()
    {
        if (is_null($this->_loginState)) {
            if(isset($_SESSION['valid']) && $_SESSION['valid'] && $this->checkActivity() ) {
                $this->_loginState = Session::CONNECTED;
            } else {
                $this->_loginState = Session::NOT_CONNECTED;
            }
        }
        return $this->_loginState;
    }

    public function logout()
    {
        $_SESSION = array(); //destroy all of the session variables
        session_destroy();
        $this->_loginState = Session::NOT_CONNECTED;
    }

    private function checkActivity()
    {
        $time = time();
        if( $time - $_SESSION['LAST_ACTIVITY']  <= SESSION_TIMEOUT ) {
            $_SESSION['LAST_ACTIVITY'] = $time;
            session_write_close();
            return True;
        } else {
            $this->logout();
            return False;
        }
    }

    public function getValue($key, $default=NULL)
    {
        if (isset($_SESSION[$key])) {
            return $_SESSION[$key];
        } elseif ($default != NULL) {
            throw new InvalidArgumentException($key.' not found');
        } else {
            return $default;
        }
    }

    public function getUsername() { return $_SESSION['username']; }
    public function getUserid() { return $_SESSION['userid']; }
    public function setValue($key, $value) { $_SESSION[$key] = $value; }

    public function __destruct()
    {
        session_write_close();
    }
}
