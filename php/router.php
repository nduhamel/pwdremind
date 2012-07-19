<?php

require_once('route.php');

/**
* Router class
*/
class Router
{

	private $_routes;
	private $_matchingRoutes;
	
	function __construct()
	{
		//Contains all the routes
		$this->_routes = array();

		//Contains the matching routes
		$this->_matchingRoutes = array();
	}

	public function addRoute() {
		$args = func_get_args();
		array_push($this->_routes, new Route($args));
	}

	//Starting the router with the HTTP infos
	public function run($method, $URI) {

		//Find the matching methods
		$this->_findMatchingMethod($this->_routes, $method);

		//In previous matching routes find the ones matching the pattern
		$this->_findMatchingPattern($this->_matchingRoutes, $URI);

		//Run the matching routes
		foreach ($this->_matchingRoutes as $route) {
			$route->run();
		}

	}

	private function _findMatchingMethod($routes, $method) {
		foreach ($routes as $route) {
			if ( $route->methodMatches($method) )
				array_push($this->_matchingRoutes, $route);
		}
	}

	private function _findMatchingPattern($routes, $URI) {
		//Reset the matching pattern array
		$this->_matchingRoutes = array();
		foreach ($routes as $route) {
			if ($route->patternMatches($URI))
				array_push($this->_matchingRoutes, $route);
		}
	}

}