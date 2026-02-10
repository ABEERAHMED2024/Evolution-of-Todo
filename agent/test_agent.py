#!/usr/bin/env python3
"""
Quick test script to verify the agent service
"""

import requests
import json

BASE_URL = "http://localhost:8001"

def test_root():
    """Test root endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/")
        print(f"[TEST] GET / - Status: {response.status_code}")
        print(f"[DATA] {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"[ERROR] Root endpoint test failed: {e}")
        return False

def test_health():
    """Test health endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"[TEST] GET /health - Status: {response.status_code}")
        print(f"[DATA] {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"[ERROR] Health endpoint test failed: {e}")
        return False

def test_chat():
    """Test chat endpoint"""
    try:
        payload = {
            "message": "Hello, can you help me create a task?",
            "conversation_history": []
        }
        response = requests.post(f"{BASE_URL}/chat/", json=payload)
        print(f"[TEST] POST /chat/ - Status: {response.status_code}")
        print(f"[DATA] {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"[ERROR] Chat endpoint test failed: {e}")
        return False

if __name__ == "__main__":
    print("="*50)
    print("Agent Service Test Suite")
    print("="*50)
    print()
    
    results = []
    
    print("[1/3] Testing root endpoint...")
    results.append(("Root", test_root()))
    print()
    
    print("[2/3] Testing health endpoint...")
    results.append(("Health", test_health()))
    print()
    
    print("[3/3] Testing chat endpoint...")
    results.append(("Chat", test_chat()))
    print()
    
    print("="*50)
    print("Test Results:")
    print("="*50)
    for name, passed in results:
        status = "[PASS]" if passed else "[FAIL]"
        print(f"{status} {name}")
    
    all_passed = all(result[1] for result in results)
    print()
    if all_passed:
        print("[OK] All tests passed!")
        exit(0)
    else:
        print("[ERROR] Some tests failed!")
        exit(1)
