import hashlib

def generate_value(key):
    # Use hashlib to generate a hash value from the key
    hash_object = hashlib.sha256(key.encode())
    # Convert the hexadecimal digest to an integer
    value = int(hash_object.hexdigest(), 16)
    return value

# Example usage:
key = "Cd5KJfmDval"
generated_value = generate_value(key)

print("Key:", key)
print("Generated Value:", generated_value)