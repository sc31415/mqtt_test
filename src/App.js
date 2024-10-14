import React, { useState, useEffect, useRef } from 'react';
import mqtt from 'mqtt';
import { debounce } from 'lodash';
import './App.css';

// Utility function to generate a unique client ID
const generateClientId = () => `mqtt_client_${Math.random().toString(16).substr(2, 8)}`;

const App = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const clientRef = useRef(null);

  const brokerUrl = process.env.REACT_APP_MQTT_BROKER_URL;
  const clientId = generateClientId();
  const options = {
    clientId: clientId,
    username: process.env.REACT_APP_MQTT_USERNAME,
    password: process.env.REACT_APP_MQTT_PASSWORD,
  };

  useEffect(() => {
    // Initialize the MQTT client once
    if (!clientRef.current) {
      const client = mqtt.connect(brokerUrl, options);
      clientRef.current = client;

      client.on('connect', () => {
        console.log(`Connected to MQTT broker with client ID: ${clientId}`);
        client.subscribe('test/topic');
      });

      client.on('message', (topic, message) => {
        setMessages((prevMessages) => [...prevMessages, message.toString()]);
      });

      // Cleanup the client connection on unmount
      return () => {
        client.end();
      };
    }
  }, [brokerUrl, options, clientId]);

  const handleInputChange = debounce((value) => {
    setInput(value);
  }, 300); // Adjust the debounce delay as needed

  const handlePublish = () => {
    if (input.trim()) {
      const client = clientRef.current;
      client.on('connect',()=>{
        console.log('a')
      })
      if (client) {
        client.publish('test/topic', input);
        setInput('');
      }
    }
  };

  const onChange = (event) => {
    handleInputChange(event.target.value);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>MQTT React App</h1>
        <div>
          <input
            type="text"
            value={input}
            onChange={onChange}
            placeholder="Enter message"
          />
          <button onClick={handlePublish}>Publish</button>
        </div>
        <div className="messages">
          <h2>Messages</h2>
          <ul>
            {messages.map((msg, index) => (
              <li key={index}>{msg}</li>
            ))}
          </ul>
        </div>
      </header>
    </div>
  );
};

export default App;
