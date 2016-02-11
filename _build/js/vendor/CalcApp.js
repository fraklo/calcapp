;(function() {
  "use strict";
  window.CalcApp = function(opts) {
    var inputs = document.getElementsByClassName('calc-input')[0],
        calcOperation = document.getElementsByClassName('calc-operation')[0],
        calcResult = document.getElementsByClassName('calc-result')[0],
        currentResult = 0,
        activeOperation = false,
        currentOperation = [];

    // Private Methods
    function extendOptions(source, properties) {
      var property;

      for(property in properties) {
        if(properties.hasOwnProperty(property)) {
          source[property] = properties[property];
        }
      }
      return source;
    }


    function handleOperation(operationType, calc, val) {
      switch (operationType) {
        case "c" :
          clearInput();
          break;
        case "+-" :
          invertValue();
          break;
        case '%' :
          percentage();
          break;
        case '/' :
          division(calc);
          break;
        case 'x' :
          multiplication(calc, val);
          break;
        case '-' :
          subtraction(calc, val);
          break;
        case '+' :
          addition(calc, val);
          break;
        case '=' :
          getResult();
          break;
        default :
          insertValue(operationType);
          break;
      }
    }


    function addition(calculate, val) {
      if(activeOperation) {
        calcResult.innerHTML = currentResult;
      }
      if(calculate) {

      } else {
        currentOperation.push(+calcResult.innerHTML);
        activeOperation = '+';
      }

      calcOperation.innerHTML += " "+calcResult.innerHTML+" + ";
      currentResult += +calcResult.innerHTML;
    }


    function getResult() {
      currentOperation.push(+calcResult.innerHTML);
      for(var i=0; i<=currentOperation.lenght; i++) {
        if(isNaN(currentOperation[i])) {
          handleOperation(currentOperation[i], currentOperation[i-1]);
        }
      }
    }


    function subtraction(calculate, val) {
      activeOperation = "-";
      if(!calculate) {
        currentOperation.push(+calcResult.innerHTML);
        currentOperation.push("-");
      }
      calcOperation.innerHTML += " "+calcResult.innerHTML+" - ";
      currentResult -= +calcResult.innerHTML;
      calcResult.innerHTML = currentResult;
    }


    function clearInput() {
      calcOperation.innerHTML = '';
      calcResult.innerHTML = 0;
      currentResult = 0;
      currentOperation = [];
      activeOperation = false;
    }


    function insertValue(value) {
      var currentResult = calcResult.innerHTML;
      if(activeOperation) {
        currentOperation.push(activeOperation);
        activeOperation = false;
        calcResult.innerHTML = value;
      } else if(value === '.') {
        handleDecimal();
      } else {
        if(currentResult === "0") {
          calcResult.innerHTML = value;
        } else {
          calcResult.innerHTML = currentResult + value;
        }
      }
    }


    function handleDecimal() {
      console.log('decimal');
    }


    function setBtnListeners() {
      var btns;

      btns = inputs.getElementsByClassName('btn');
      for(var btn of btns) {
        btn.addEventListener('click', function(e) {
          handleOperation(e.currentTarget.getAttribute('data-operation'));
        });
      }
    }


    setBtnListeners();
  }

}());
