#!/usr/bin/env python3
"""
Backend API Testing for IE Valdivia Portal
Tests the FastAPI backend endpoints
"""

import requests
import sys
import json
from datetime import datetime

class BackendTester:
    def __init__(self, base_url="http://localhost:8001"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.errors = []

    def log_result(self, test_name, success, message="", response_data=None):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {test_name}: {message}")
        else:
            print(f"❌ {test_name}: {message}")
            self.errors.append(f"{test_name}: {message}")
        
        if response_data:
            print(f"   Response: {json.dumps(response_data, indent=2)}")
        print()

    def test_root_endpoint(self):
        """Test the root API endpoint"""
        try:
            response = requests.get(f"{self.base_url}/api/", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("message") == "Hello World":
                    self.log_result("Root Endpoint", True, "API is responding correctly", data)
                    return True
                else:
                    self.log_result("Root Endpoint", False, f"Unexpected response: {data}")
                    return False
            else:
                self.log_result("Root Endpoint", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except requests.exceptions.ConnectionError:
            self.log_result("Root Endpoint", False, "Connection refused - Backend server not running")
            return False
        except requests.exceptions.Timeout:
            self.log_result("Root Endpoint", False, "Request timeout")
            return False
        except Exception as e:
            self.log_result("Root Endpoint", False, f"Unexpected error: {str(e)}")
            return False

    def test_create_status_check(self):
        """Test creating a status check"""
        try:
            test_data = {
                "client_name": f"test_client_{datetime.now().strftime('%H%M%S')}"
            }
            
            response = requests.post(
                f"{self.base_url}/api/status", 
                json=test_data,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("client_name") == test_data["client_name"] and "id" in data:
                    self.log_result("Create Status Check", True, "Status check created successfully", data)
                    return data["id"]
                else:
                    self.log_result("Create Status Check", False, f"Invalid response structure: {data}")
                    return None
            else:
                self.log_result("Create Status Check", False, f"HTTP {response.status_code}: {response.text}")
                return None
                
        except Exception as e:
            self.log_result("Create Status Check", False, f"Error: {str(e)}")
            return None

    def test_get_status_checks(self):
        """Test retrieving status checks"""
        try:
            response = requests.get(f"{self.base_url}/api/status", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_result("Get Status Checks", True, f"Retrieved {len(data)} status checks", {"count": len(data)})
                    return True
                else:
                    self.log_result("Get Status Checks", False, f"Expected list, got: {type(data)}")
                    return False
            else:
                self.log_result("Get Status Checks", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Get Status Checks", False, f"Error: {str(e)}")
            return False

    def test_cors_headers(self):
        """Test CORS configuration"""
        try:
            response = requests.options(f"{self.base_url}/api/", timeout=10)
            
            cors_headers = {
                'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
                'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
                'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
            }
            
            if cors_headers['Access-Control-Allow-Origin']:
                self.log_result("CORS Configuration", True, "CORS headers present", cors_headers)
                return True
            else:
                self.log_result("CORS Configuration", False, "CORS headers missing", cors_headers)
                return False
                
        except Exception as e:
            self.log_result("CORS Configuration", False, f"Error: {str(e)}")
            return False

    def run_all_tests(self):
        """Run all backend tests"""
        print("🔍 Starting Backend API Tests for IE Valdivia Portal")
        print("=" * 60)
        print()

        # Test basic connectivity first
        if not self.test_root_endpoint():
            print("❌ Backend server is not accessible. Stopping tests.")
            return False

        # Test API endpoints
        status_id = self.test_create_status_check()
        self.test_get_status_checks()
        self.test_cors_headers()

        # Print summary
        print("=" * 60)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.errors:
            print("\n❌ Failed Tests:")
            for error in self.errors:
                print(f"   • {error}")
        
        success_rate = (self.tests_passed / self.tests_run) * 100 if self.tests_run > 0 else 0
        print(f"✅ Success Rate: {success_rate:.1f}%")
        
        return self.tests_passed == self.tests_run

def main():
    """Main test function"""
    tester = BackendTester()
    
    try:
        success = tester.run_all_tests()
        return 0 if success else 1
    except KeyboardInterrupt:
        print("\n⚠️ Tests interrupted by user")
        return 1
    except Exception as e:
        print(f"\n💥 Unexpected error during testing: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main())