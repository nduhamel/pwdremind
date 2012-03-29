<?php
class Session {

	private $loginState;

	public function __construct() {
		session_start();
	}

	protected function login($userid){
		session_regenerate_id ();
		$_SESSION['valid'] = True;
		$_SESSION['username'] = $userid;
		$_SESSION['LAST_ACTIVITY'] = time();
		$this->loginState = True;
	}

	public function is_logged_in(){

		if (is_null($this->loginState)){
			if(isset($_SESSION['valid']) && $_SESSION['valid'] && $this->check_activity() ){
				$this->loginState = True;
			}else{
				$this->loginState = False;
			}
		}

		return $this->loginState;
	}

	public function logout(){
		$_SESSION = array(); //destroy all of the session variables
		session_destroy();
		$this->loginState = False;
	}

	public function get_username(){
		return $_SESSION['username'];
	}

	private function check_activity(){
		$time = time();
		if( $time - $_SESSION['LAST_ACTIVITY']  <= SESSION_TIMEOUT ){
			session_regenerate_id(true);
			$_SESSION['LAST_ACTIVITY'] = $time;
			return True;
		}else{
			$this->logout();
			return False;
		}
	}

	public function getValue($key, $default=NULL) {
		if (isset($_SESSION[$key])){
			return $_SESSION[$key];
		} elseif ($default != NULL) {
			throw new InvalidArgumentException($key.' not found');
		} else {
			return $default;
		}
	}

	public function setValue($key, $value) {
		$_SESSION[$key] = $value;
	}

	public function __destruct() {
		session_write_close();
	}
}
