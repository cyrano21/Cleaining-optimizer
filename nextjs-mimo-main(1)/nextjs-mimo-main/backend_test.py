#!/usr/bin/env python3
"""
Backend API Testing for NextMimo Application
Tests all API endpoints available in the Next.js application
"""

import requests
import sys
import json
from datetime import datetime

class NextMimoAPITester:
    def __init__(self, base_url="http://localhost:3004"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.api_prefix = "/api"

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}{self.api_prefix}/{endpoint}"
        if headers is None:
            headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                except:
                    print(f"   Response: {response.text[:200]}...")
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")

            return success, response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text

        except requests.exceptions.RequestException as e:
            print(f"❌ Failed - Network Error: {str(e)}")
            return False, {}
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_profile_api(self):
        """Test profile API endpoint"""
        return self.run_test(
            "Profile API",
            "GET",
            "profile",
            200
        )

    def test_ai_assistant_api(self):
        """Test AI assistant API endpoint"""
        test_data = {
            "query": "Qu'est-ce que React?",
            "lessonContext": {
                "title": "Introduction à React",
                "difficulty": "débutant",
                "concepts": ["React", "Components", "JSX"]
            },
            "history": []
        }
        
        return self.run_test(
            "AI Assistant API",
            "POST",
            "ai-assistant",
            200,
            data=test_data
        )

    def test_ai_assistant_api_no_query(self):
        """Test AI assistant API with missing query"""
        test_data = {
            "lessonContext": {
                "title": "Test",
                "difficulty": "débutant"
            }
        }
        
        return self.run_test(
            "AI Assistant API (No Query)",
            "POST",
            "ai-assistant",
            400,
            data=test_data
        )

    def test_modules_api(self):
        """Test modules API endpoint"""
        return self.run_test(
            "Modules API",
            "GET",
            "modules",
            200
        )

    def test_user_projects_api(self):
        """Test user projects API endpoint"""
        return self.run_test(
            "User Projects API",
            "GET",
            "user-projects",
            200
        )

    def test_analyze_code_api(self):
        """Test code analysis API endpoint"""
        test_data = {
            "code": "console.log('Hello World');",
            "language": "javascript"
        }
        
        return self.run_test(
            "Analyze Code API",
            "POST",
            "analyze-code",
            200,
            data=test_data
        )

    def test_tech_radar_api(self):
        """Test tech radar API endpoint"""
        return self.run_test(
            "Tech Radar API",
            "GET",
            "tech-radar",
            200
        )

    def test_portfolio_api(self):
        """Test portfolio API endpoint"""
        return self.run_test(
            "Portfolio API",
            "GET",
            "portfolio",
            200
        )

    def test_lesson_api(self):
        """Test lesson API endpoint"""
        return self.run_test(
            "Lesson 1-2 API",
            "GET",
            "lesson-1-2",
            200
        )

def main():
    print("🚀 Starting NextMimo API Tests")
    print("=" * 50)
    
    # Initialize tester
    tester = NextMimoAPITester()
    
    # Test all API endpoints
    print("\n📊 Testing Core APIs...")
    tester.test_profile_api()
    tester.test_modules_api()
    tester.test_user_projects_api()
    tester.test_portfolio_api()
    tester.test_lesson_api()
    tester.test_tech_radar_api()
    
    print("\n🤖 Testing AI Assistant APIs...")
    tester.test_ai_assistant_api()
    tester.test_ai_assistant_api_no_query()
    
    print("\n🔍 Testing Code Analysis APIs...")
    tester.test_analyze_code_api()
    
    # Print final results
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print(f"⚠️  {tester.tests_run - tester.tests_passed} tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())