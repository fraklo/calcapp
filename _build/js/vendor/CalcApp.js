;(function() {
  "use strict";
  window.CalcApp = function() {
    var calc = document.getElementsByClassName('js_calc')[0],
        operationDisplay = calc.getElementsByClassName('js_calc_operation')[0],
        resultDisplay = calc.getElementsByClassName('js_calc_result')[0],
        activeOperation = false,
        currentResult = 0,
        activeNumber = false,
        currentOperation = [],
        historyList = [];


    // Determine what operation needs to be performed
    function handleOperation(operationType, val) {
      switch (operationType) {
        case "c" :
          resetCalc(true);
          break;
        case "+-" :
          plusMinus();
          break;
        case '%' :
          percentage();
          break;
        case '/' :
          division(val);
          break;
        case 'x' :
          multiplication(val);
          break;
        case '-' :
          subtraction(val);
          break;
        case '+' :
          addition(val);
          break;
        case '=' :
          calcTotal(true);
          break;
      }
    }


    // Invert number
    function plusMinus() {
      resultDisplay.innerHTML = "-"+resultDisplay.innerHTML;
    }


    // Performs addition
    function addition(val) {
      if(val) {
        // if value perform calculation
        currentResult = currentResult + val;
      } else {
        // else only set operation
        updateOperation("+");
      }
    }


    // Performs Division
    function division(val) {
      if(val) {
        // if value perform calculation
        currentResult = currentResult / val;
      } else {
        // else only set operation
        updateOperation("/");
      }
    }


    // Performs Multiplication
    function multiplication(val) {
      if(val) {
        // if value perform calculation
        currentResult = currentResult * val;
      } else {
        // else only set operation
        updateOperation("x");
      }
    }


    // Performs Subtraction
    function subtraction(val) {
      if(val) {
        // if value perform calculation
        currentResult = currentResult - val;
      } else {
        // else only set operation
        updateOperation("-");
      }
    }


    // Handles percentage
    function percentage() {
      var percentageValue = +resultDisplay.innerHTML * .01;

      if(currentResult > 0) {

        // currentValue exists so calculate percentage off of that
        percentageValue = percentageValue * currentResult;
      }

      resultDisplay.innerHTML =  percentageValue;
    }


    // Only allow decimal if no decimal present
    function handleDecimal() {
      if(resultDisplay.innerHTML.indexOf(".") < 0) {
        resultDisplay.innerHTML = resultDisplay.innerHTML +".";
      }
    }


    // Reset calculator state
    function resetCalc(clearAll) {
      operationDisplay.innerHTML = '';
      currentOperation = [];
      activeNumber = false;
      if(clearAll) {

        // clear button was pressed, clear all the things
        // reset to intial state
        activeOperation = false;
        resultDisplay.innerHTML = 0;
      } else {
        activeOperation = '=';
      }
    }


    // Calculates the total for the current operation
    function calcTotal(isEquals) {
      if(isEquals) {

        // Equals button pressed, append current result value
        // to currentOperation
        currentOperation.push(+resultDisplay.innerHTML);
      }
      currentResult = currentOperation[0];

      // Iterate through operations to calculate out
      for(var i=1; i <= currentOperation.length; i++) {
        if(isNaN(currentOperation[i]) &&
            !isNaN(currentOperation[i+1])) {

          // This is an operation and the next value is a number
          // perform a calculation using the current operation
          // and the next number to modify the current value
          handleOperation(currentOperation[i], currentOperation[i+1]);
        }
      }

      // Set result display to current result
      resultDisplay.innerHTML = currentResult;
      if(isEquals) {

        // store the current operation
        updateHistory();

        // clear the current operation
        resetCalc();
      }
    }


    // Add value to result display
    function appendValue(value) {
      if(activeOperation && activeOperation !== "=") {

        // there is an active operation so update currentOperation with it
        currentOperation.push(activeOperation);

        // reset activeOperation
        activeOperation = false;
      }
      if(value === '.') {
        handleDecimal();
      } else {
        if(!activeNumber) {

          // Value replaces display result
          resultDisplay.innerHTML = value;
          activeNumber = true;
        } else {

          // Value is concatenated to display result
          resultDisplay.innerHTML = resultDisplay.innerHTML + value;
        }
      }
    }


    // Updates the history element with the current operation
    function updateHistory() {
      var historyEl;

      // Insert currentOperation into historlist for later retrieval
      historyList.push(currentOperation);

      // Create history element with operation display contents
      historyEl = document.createElement('div');
      historyEl.innerHTML = currentOperation.join(" ");

      // Update operation display with id to pull operation from historylist
      historyEl.setAttribute('data-history-id', historyList.length - 1);

      // add click event handler
      historyEl.addEventListener('click', historyClickHandler);

      // insert operation display into calc history el
      calc.getElementsByClassName('js_calc_history')[0]
                                  .appendChild(historyEl);
    }


    // Updates current operation
    // and displays new result
    function updateOperation(operation) {
      if(currentOperation.length < 1 ||
          (!activeOperation && activeNumber)) {

        // Just added some values so update operation and calc total
        activeNumber = false;
        currentOperation.push(+resultDisplay.innerHTML);
        operationDisplay.innerHTML += " "+resultDisplay.innerHTML +
                                      " "+operation+" ";
        calcTotal();
      } else {

        // Change operation from previous value to current
        operationDisplay.innerHTML = operationDisplay.innerHTML.slice(0, -2) +
                                      " "+operation;
      }
      activeOperation = operation;
    }


    // Handles history element clicks
    function historyClickHandler(evt) {
      var el = evt.currentTarget,
          historyOp = historyList[el.getAttribute('data-history-id')];

      resetCalc(true);

      operationDisplay.innerHTML = historyOp.join(" ");
      currentOperation = historyOp;
      historyBtnClickHandler();
      calcTotal();
    }


    // Handles history button clicks
    function historyBtnClickHandler() {
      var el = calc.getElementsByClassName('js_calc_history_btn')[0],
          calcHistory = calc.getElementsByClassName('js_calc_history')[0];
      toggleClass(calcHistory, 'active');
      toggleClass(el, 'active');
    }


    // Handles input button clicks
    function inputBtnClickHandler(evt) {
      var el = evt.currentTarget,
          op;

      if(op = el.getAttribute('data-operation')) {
        handleOperation(op);
      } else {
        appendValue(el.getAttribute('data-value'));
      }
    }


    // Sets click handlers for js_calc_btn buttons
    function setInputBtnListeners() {
      var btns = calc.getElementsByClassName('js_calc_btn'),
          btn,
          i;
      // loop over all buttons
      for(i=0; i < btns.length; i++) {

        btn = btns[i];
        // add click event handler
        btn.addEventListener('click', inputBtnClickHandler);
      }
    }


    // Sets click handler for js_calc_history_btn
    function setHistoryBtnListener() {
      var historyBtn = calc.getElementsByClassName('js_calc_history_btn')[0];

      // add click event handler
      historyBtn.addEventListener('click', historyBtnClickHandler);
    }


    // Sets given class on el if it doesn't have it
    // if it has it, it removes the given class
    function toggleClass(el, toggleClass) {
      if(el.className.indexOf(toggleClass) < 0) {
        el.className = el.className+" "+toggleClass;
      } else {
        el.className = el.className.replace(toggleClass, "").trim();
      }
    }


    function init() {
      setInputBtnListeners();
      setHistoryBtnListener();
    }


    // Start the show
    init();
  }
}());
