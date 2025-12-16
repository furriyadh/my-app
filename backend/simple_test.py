
try:
    with open('simple_test.log', 'w') as f:
        f.write("Python is running!\n")
    
    import sys
    with open('simple_test.log', 'a') as f:
        f.write(f"Version: {sys.version}\n")
        
    import dotenv
    with open('simple_test.log', 'a') as f:
        f.write("Dotenv imported successfully!\n")
        
except Exception as e:
    try:
        with open('simple_test.log', 'a') as f:
            f.write(f"Error: {e}\n")
    except:
        pass
