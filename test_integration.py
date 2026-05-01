#!/usr/bin/env python3
"""
Strict Integration Test Suite for Fraud Detection System
Tests backend-frontend integration with comprehensive validation
"""

import requests
import json
import time
from typing import Dict, List, Any
from datetime import datetime

class IntegrationTester:
    def __init__(self, backend_url: str = "http://localhost:8000"):
        self.backend_url = backend_url
        self.results = []
        self.passed = 0
        self.failed = 0
    
    def test(self, name: str, url: str, method: str = "GET", expected_status: int = 200, 
             expected_fields: List[str] = None, validate_func = None) -> bool:
        """Run a single test"""
        try:
            print(f"\n[TEST] {name}")
            print(f"  URL: {url}")
            
            if method == "GET":
                response = requests.get(url, timeout=5)
            elif method == "POST":
                response = requests.post(url, timeout=5)
            else:
                raise ValueError(f"Unsupported method: {method}")
            
            # Check status code
            if response.status_code != expected_status:
                self.fail(name, f"Expected status {expected_status}, got {response.status_code}")
                return False
            
            # Parse JSON
            try:
                data = response.json()
            except json.JSONDecodeError as e:
                self.fail(name, f"Response is not valid JSON: {e}")
                return False
            
            # Check expected fields
            if expected_fields:
                missing = [f for f in expected_fields if f not in data]
                if missing:
                    self.fail(name, f"Missing fields: {missing}")
                    return False
            
            # Custom validation
            if validate_func:
                validation_error = validate_func(data)
                if validation_error:
                    self.fail(name, f"Validation failed: {validation_error}")
                    return False
            
            self.pass_test(name, f"Status {response.status_code}, Valid JSON, All fields present")
            return True
        
        except requests.exceptions.ConnectionError:
            self.fail(name, f"Cannot connect to {url}")
            return False
        except requests.exceptions.Timeout:
            self.fail(name, "Request timeout")
            return False
        except Exception as e:
            self.fail(name, str(e))
            return False
    
    def pass_test(self, name: str, message: str):
        """Record passing test"""
        self.passed += 1
        print(f"  ✅ PASSED: {message}")
        self.results.append({"name": name, "status": "PASSED", "message": message})
    
    def fail(self, name: str, message: str):
        """Record failing test"""
        self.failed += 1
        print(f"  ❌ FAILED: {message}")
        self.results.append({"name": name, "status": "FAILED", "message": message})
    
    def run_all_tests(self):
        """Run all integration tests"""
        print("=" * 80)
        print("STRICT INTEGRATION TEST SUITE")
        print(f"Backend URL: {self.backend_url}")
        print(f"Test Time: {datetime.now().isoformat()}")
        print("=" * 80)
        
        # Test 1: Health Check
        self.test(
            "Health Check",
            f"{self.backend_url}/health",
            expected_fields=["status", "model_loaded", "device"],
            validate_func=lambda d: None if d.get("status") == "ok" else "Status is not 'ok'"
        )
        
        # Test 2: Data Validation
        self.test(
            "Data Validation Endpoint",
            f"{self.backend_url}/validate-data",
            expected_fields=["status", "errors", "warnings", "data_integrity"],
            validate_func=self._validate_data_validation
        )
        
        # Test 3: Fraud Statistics
        self.test(
            "Fraud Statistics Endpoint",
            f"{self.backend_url}/fraud-stats",
            expected_fields=["labels", "data", "percentages", "total", "fraud_rate"],
            validate_func=self._validate_fraud_stats
        )
        
        # Test 4: Graph Data (Small)
        self.test(
            "Graph Data Endpoint (limit=50)",
            f"{self.backend_url}/graph-data?limit=50",
            expected_fields=["nodes", "links", "metadata"],
            validate_func=self._validate_graph_data
        )
        
        # Test 5: Graph Data (Medium)
        self.test(
            "Graph Data Endpoint (limit=100)",
            f"{self.backend_url}/graph-data?limit=100",
            expected_fields=["nodes", "links", "metadata"],
            validate_func=self._validate_graph_data
        )
        
        # Test 6: Statistics with Fraud Calculation
        self.test(
            "Fraud Rate Calculation",
            f"{self.backend_url}/fraud-stats",
            validate_func=self._validate_fraud_calculation
        )
        
        # Test 7: Node Structure Validation
        self.test(
            "Graph Node Structure",
            f"{self.backend_url}/graph-data?limit=10",
            validate_func=self._validate_node_structure
        )
        
        # Test 8: Edge Structure Validation
        self.test(
            "Graph Edge Structure",
            f"{self.backend_url}/graph-data?limit=10",
            validate_func=self._validate_edge_structure
        )
        
        # Print summary
        self.print_summary()
    
    def _validate_data_validation(self, data: Dict) -> str:
        """Validate data validation response"""
        if data["status"] not in ["ok", "warning", "error"]:
            return "Status must be ok, warning, or error"
        
        if not isinstance(data["errors"], list):
            return "Errors must be a list"
        
        if not isinstance(data["warnings"], list):
            return "Warnings must be a list"
        
        return None
    
    def _validate_fraud_stats(self, data: Dict) -> str:
        """Validate fraud statistics response"""
        # Check arrays
        if len(data["labels"]) != 2:
            return "Labels should have 2 elements"
        
        if len(data["data"]) != 2:
            return "Data should have 2 elements"
        
        if len(data["percentages"]) != 2:
            return "Percentages should have 2 elements"
        
        # Check sum
        legitimate = data["data"][0]
        fraudulent = data["data"][1]
        total = data["total"]
        
        if legitimate + fraudulent != total:
            return f"Sum of data ({legitimate + fraudulent}) != total ({total})"
        
        # Check percentages
        total_pct = sum(data["percentages"])
        if abs(total_pct - 100.0) > 0.01:
            return f"Percentages sum to {total_pct}, expected 100"
        
        return None
    
    def _validate_fraud_calculation(self, data: Dict) -> str:
        """Validate fraud rate calculation"""
        fraudulent = data["data"][1]
        total = data["total"]
        expected_rate = (fraudulent / total * 100) if total > 0 else 0
        
        if abs(data["fraud_rate"] - expected_rate) > 0.01:
            return f"Fraud rate {data['fraud_rate']} != expected {expected_rate}"
        
        return None
    
    def _validate_graph_data(self, data: Dict) -> str:
        """Validate graph data response"""
        # Check nodes
        if not isinstance(data["nodes"], list):
            return "Nodes must be a list"
        
        if len(data["nodes"]) == 0:
            return "Nodes list is empty"
        
        # Check links
        if not isinstance(data["links"], list):
            return "Links must be a list"
        
        # Check metadata
        if not isinstance(data["metadata"], dict):
            return "Metadata must be a dict"
        
        return None
    
    def _validate_node_structure(self, data: Dict) -> str:
        """Validate individual node structure"""
        if len(data["nodes"]) == 0:
            return "No nodes to validate"
        
        required_fields = ["id", "label", "address", "fraud_probability", "is_fraud", "risk", "color"]
        
        node = data["nodes"][0]
        for field in required_fields:
            if field not in node:
                return f"Node missing field: {field}"
        
        # Validate field types
        if not isinstance(node["fraud_probability"], (int, float)):
            return "fraud_probability must be numeric"
        
        if not (0 <= node["fraud_probability"] <= 1):
            return f"fraud_probability out of range: {node['fraud_probability']}"
        
        if node["is_fraud"] not in [0, 1]:
            return f"is_fraud must be 0 or 1, got {node['is_fraud']}"
        
        if node["risk"] not in [0, 1]:
            return f"risk must be 0 or 1, got {node['risk']}"
        
        return None
    
    def _validate_edge_structure(self, data: Dict) -> str:
        """Validate individual edge structure"""
        if len(data["links"]) == 0:
            return None  # No edges is acceptable
        
        link = data["links"][0]
        
        if "source" not in link:
            return "Link missing 'source' field"
        
        if "target" not in link:
            return "Link missing 'target' field"
        
        if link["source"] == link["target"]:
            return "Self-loops detected"
        
        return None
    
    def print_summary(self):
        """Print test summary"""
        total = self.passed + self.failed
        percentage = (self.passed / total * 100) if total > 0 else 0
        
        print("\n" + "=" * 80)
        print("TEST SUMMARY")
        print("=" * 80)
        print(f"Total Tests: {total}")
        print(f"Passed: {self.passed} ✅")
        print(f"Failed: {self.failed} ❌")
        print(f"Success Rate: {percentage:.1f}%")
        print("=" * 80)
        
        if self.failed == 0:
            print("🎉 ALL TESTS PASSED! Backend-Frontend integration is STRICT and WORKING!")
        else:
            print("\n⚠️  FAILED TESTS:")
            for result in self.results:
                if result["status"] == "FAILED":
                    print(f"  - {result['name']}: {result['message']}")
        
        print("=" * 80)
        
        return self.failed == 0


def main():
    """Main entry point"""
    tester = IntegrationTester()
    success = tester.run_all_tests()
    exit(0 if success else 1)


if __name__ == "__main__":
    main()
