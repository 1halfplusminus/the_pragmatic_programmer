# PRAGMATIC PROGRAMMER

## Assertive Programming

### Use Assertions to prevent the impossible

> Whenever you find yourself thinking "but of course that could never happed." add code to check it.

```c
assert(result != null)
```

```java
assert result != null && result.size() > 0 : "Empty result from XYZ";
```

```c
books = my_sort(find("scifi"))
assert(is_sorted?(books))
```

Don't use assertions in place of real error handling example with IO

Assertions check for things that should never happen.

```c

puts("Enter `Y` or `N`")
ans = gets[0] # Grab first character of response
assert((ch == 'Y') || (ch == 'N')) # Very bad idea!

```

### Assertions and Side Effects

Don't use assertion if the condition has side effects.

```java

while(iter.hasMoreElements()) {
    assert(iter.nextElement() != null); // BAD: iter.nextElement() move the cursor of the iterator
    Object = obj = iter.nextElement();
}

```

### Leave assertions Turned On

### Exercise 16

Which of the "impossible" things can happen ?

- A month with fewer than 28 days -> possible
- Error code from a system call: can't access the current directory -> possible (lock, directory removed, permission error)
- In C++: a=2; b = 3; but (a+b) does not equal 5 -> possible
- A triangle with an interior angle sum = 180° -> possible
- A minute that doesn't have 60 seconds -> possible
- (a+1) <= a -> possible

## How to balance resources

> To light a candle is to cast shadow...

We all manage resources whener we code : memory, transactions, threads, network connections , files, timers -- all kinds of things with limited availability.

### Finish What You Start

This tip is easy to apply in most circumstances. It simply means that the function or object that allocates a resource should be responsible for deallocating it.

```ruby
def read_customer
    @customer_file = File.open(@name + ".rec", "r+")
    @balance       = BigDecimal(@customer_file.gets)
end

def write_customer
    @customer_file.rewind
    @customer_file.puts @balance.to_s
    @customer_file.close
end

def update_customer(transaction_amount)
    read_customer
    @balance = @balance.add(transaction_amount, 2)
    write_customer
end
```

Is bad example @customer_file is shared globaly between the two function.

```ruby

def read_customer(file)
    @balance=BigDecimal(file.gets)
end

def write_customer(file)
    file.rewind
    file.puts @balance.to_s
end

def update_customer(transaction_amount)
    file= file.open(@name + ".rec", "r+")
    read_customer(file)
    @balance = @balance.add(transaction_amount,2)
    file.close
end

```

Instead of holding on the file reference, we've changed the code to pass it as parameter. Now all the responsibility
for the file is in the update_customer routine.

Updgrade with enclosed block if language allow it:

```ruby

def update_customer(transaction_amount)
    File.open(@name + ".rec", "r+") do |file|
        read_customer(file)
        @balance = @balance.add(transaction_amount, 2)
        write_customer(file)
    end
end

```

In this case, at the end of the block the file variable goes out of scope.

### Act Locally

#### Balancing Over Timers

For anything that you create that takes up a finite resource, consider how to balance it.

### Nest Allocations

The basic pattern for resource allocation can be extended for routines that need more than one resource at time.

- Deallocate resources in the opposite order to that in which you allocate them. That way you won't orphan resources if
  one resource contains references to another.
- When allocating the same set of resources in different places in your code, always allocate them in the same order.
  This will reduce the possibility of deadlock.

### Object and Exception

If you are programming in an object-oriented language, you may fnd it useful to encapsulate reources in classes. Each time you need a particular resource type, you instantiate an object of that class.
When the object goes out of scope, or is reclaimed by the garbage collector, the object
destructor then deallocates the wrapped resource.

### Balancing and Exceptions

Languages that support exceptions can make resource dealocation tricky.

You generally have two choices:

1. Use variable scope (for example, stack variables in C++ or Rust)
2. Use a finally clause in a try...catch block

### And Exception Antipattern

We commonly see folks writing something like this:

begin
thing = allocate_resource()
process(thing)
finally
deallocate(thing)

What happens if resource allocation fails and raises an exception ?
The finally clause will catch it, and try to deallocate a thing that was never allocated.

The correct pattern for handling resource deallocation in an environment with exceptions is

thing = allocate_resource()
begin
process(thing)
finally
deallocate(thing)
end

### When You Can't Balance Resources

There are times when the basic resource allocation pattern just isn't appropriate. For
Commonly this is found in programs that use dynamic data structures.

One routine will allocate an area of memory and link it into some larger structure, where it may stay for some time.

The trick here is to establish a semantic invariant for memory allocation. You need to decide who is responsible for data
in an aggregate data structure.

What happens when you deallocate the top-level structure ?

You have three main options:

- The top-level structure is also responsible for freeing any substructures that it contains. These structures then recursively delete data they contain, and so on.
- The top-level structure is simply deallocated. Any structures that it pointed to (that are not referenced elsewhere) are orphaned.
- the top-level structure refuses to deallocate itself if it contains any substructures.

The choice here depends on the circumstances of each individual data structure.
Our preference in these circumstances is to write a module for each major structure that provides standard allocation and deallocation facilities for that strcture. (This module can alswo provide facilities such as debug printng, serialization, deserialization and traversal hooks)

### Checking Balance

Because Pragmatic Programmers trust no one, including ourselves, we feel that it is always a good idea to build code that actually checks that resources are indeed freed appropriately. For most applications, this normally means producing wrappers for each type of resource, and using these wrappers to keep track of all allocations and deallocations.

At certain points in your code, the program logic will dictate that the resources will be in a certain state:
use the wrappers to check this.

### Dont't Outrun Your Headlights

> It's tough to make predictions, especially about the future.

In software development, our "headlights" are similarly limited.
We can't see too far ahead into the future, and the further off-axis you look,
the darker it gets. So pragmatic Programmers have a firm rule:

### Take Small Steps -- Always

Always take small, deliberate steps, checking for feedback and adjusting before proceeding.
Consider that the rate of feedback is your speed limit.
You never tkae on a step or a task that's "too big."

What do we mean exactly by feedback? Anything that independently confirms or disproves your action
For example:

- Results in a REPL provide feedback on your understaning of APIs and algorithms
- Unit tests provide feedback on your last code change
- User demo and conversation provide feedback on features and usability

What's a task that's too big ? Any task that requires "fortune telling" just as the car headlights have limited throw,
we can only see into the future perhaps one or two steps, maybe a few hours or days at most. Beyond that, you quickly gets
pas educated guess and into wild speculation

You might find yourself slipping into fortune telling when you have to:

- Estimate completion dates months in the future
- Plan a design for future maintenance or extendability
- Guess user's future needs
- Guess future tech availiability

Making code replaceable will also help with cohesion, coupling, decoupling, and DRY, leading to a better design overall.

### Black Swans

In his book , [The Black Swan: The impact of the Highly Improbable][].

[the black swan: the impact of the highly improbable]: (https://www.amazon.fr/Black-Swan-Impact-Highly-Improbable/dp/0141034599)

Nassim Nicholas Taleb posits that all significant events in history have come from high-profile,hard-to-predict, and rare events that are beyond the realm of normal expectations. These outliers, while statistically rare,
have disproportionate effects. In addition, our own cognitive biases tend to blind us to changes creeping up on the edges of your work.

### Avoid Fortune-Telling

Much of the time, tomorrow looks a lot like today. But don't count on it.

## Bend, or Break

The code that we write doesn't stand still. We need to make every effort to write code that's as loose -- as flexible -- as possible.

Or we may find our code quickly becoming outdated, or too brittle to fix.

## Decoupling

Coupling is the enemy of change , it links together things that mus change in parallel.
You're designing software that you'll want to change for it to be flexible, individual components should be coupled to as fex other components as possible.

To make matters worse, coupling is transitive.

This means there's a simple principle you should follow:

### Decoupled Code Is Easier to Change

The symptoms of coupling:

- Wacky dependencies between unrelated modules or libraries.
- "Simple" changes to one module that propagate through unrelated modules in the system or break stuff elsewhere in the system.
- Developers who are afraid to change code because they aren't sure what might be affected.
- Meetings where everyone has to attend because no one is sure who will be affected by a change.

### Train Wrecks

We've all seen (and probaly written) code like this:

```java

public void applyDiscount(customer,order_id,discount) {
    totals = customer.orders.find(order_id).getTotals();
    totals.grandTotal = totals.grandTotal - discount;
    totals.discount = discount;
}

```

This chunk of code is traversing five levels of abstraction, from customer to total amounts.
That's a lot of implicit knowledge. But worse that's lot of thing that cannot change in the future.

Let's imagine that the business decides that no order can have a discount of more than 40%.
Where would we put the code that enforce that rule ?

You might say it belongs in the applyDiscount function we just wrote.
But with the code the way it is now. Any piece of code anywhere, could set fields in the totals object.

One way to look at this is to think about responsibilities. Surely the totals object should be responsible for managing the totals. And yet it isn't.

The fix for that is to apply something we call:

### Tell, Don't Ask

You shouldn't make decisions based on the internal state of an object and then update that object.
Doing so destroys the benefits of encapsulation.

Fixed example:

```java

public void applyDiscount(customer,order_id, discount) {
    customer
    .findOrder(order_id)
    .applyDiscount(discount);
}

```

TDA is not a law of nature; it's just a pattern to help us

Here order is a part of customer API. So it's fine to expose it.

### The Law of Demeter

In the relation of coupling the Law Of Demete is a set of rule that in a class C should only call:

1. Other instance methods in C
2. Its parameters
3. Methods in objects that it creates, both on the stack and in the heap
4. Global variables

The global variable should be removed.

### Don't chain method Calls

Try don't to do more than one "." when access something.

Example:

```ruby

# This is pretty poor style

# and so is This

orders = customer.orders;
last = orders.last();
totals = last.totals();
amount = totals.amount;

```

There only one exception thing that don't change a lot like language API

```ruby

people
.sort_by(|person| person.age)
.first(10)
.map(| person | person.name)

```

### Avoid Global Data

Global data includes singletons.
Global Data Includes External Resources.

If it's important Enough to Be Global. Wrap It in an API

### Inheritance Adds Coupling

The misuse of subclassing, where a class interits state and behaviour from another class. Add dangerous coupling

### Again, It's All About Change

Coupled code is had to change, Keeping your code shy will help keep your applications decoupled.

## Juggling the Real World

### Events

An event represents the availability of information.
If we write applications that respond to events adjust what they do based on those events, those applications will work better in the real world.

Let's look at four strategies that help to build that type of application:

1. Finite State Machines
2. The observer Pattern
3. Pusblish / Subscribe
4. Reactive Programming and Streams

### Finite State Machine

#### The Anatomy of a Pragmatic FSM

A state machine is just a specification of how to handle events.
It consists of a set of states, one of which is the current state.
For each state , we list the events that are significant to that state.
For each of thos events, we define the new current state of the system.

For example, we may receiving multipart messages from a web-socket.
The first message is a header. This is followed by any number of data messages,
followed by a trailing message

The neat thing about FMS is that we can express them purely as data.
Here's a table representing our message parser

| State   | Events  |         |         |       |
| ------- | :-----: | :-----: | :-----: | :---: |
|         | Header  |  Data   | Trailer | Other |
| Initial | Reading |  Error  |  Error  | Error |
| Reading |  Error  | Reading |  Done   | Error |

Tehe code that handles its is equally simple:

```ruby

TRANSITIONS = {
    initial: {header: :reading},
    reading:{data: :reading, trailer: :done},
}

state = :inital

while state != :done && state != :error
    msg = get_next_message()
    state = TRANSITIONS[state][msg.msg_type] || :error
end

```

### Adding Actions

You can beef a FSM by adding actions that are triggered on certain transitions.

For example, we might need to extract all of the strings in a source file.
A string is text between quotes, but a backslash in a string escapes the next character,
so "ignore \"quotes\"" is a single string.

![alt](./FSM_action.png)

event/strings_fsm.rb

```ruby

TRANSITIONS = {
    look_for_string: {
        ''''=> [:in_string,:start_new_string],
        :default => [:look_for_string, :ignore]
    },

    in_string: {
        '''' => [:look_for_string, :finish_current_string],
        '\\' => [:copy_next_char, :add_current_to_string],
        :default => [:in_string, :add_current_to_string],
    ],

    copy_next_char: {
        :default => [:in_string, :add_current_to_string],
    },
}

```

event/strings.fsm.ruby

```ruby

state = :look_for_string
result = []

while ch = STDIN.getc
state, action = TRANSITIONS[state][ch] || TRANSITIONS[state][:default]
case action
when :ignore
when :start_new_string
result = []
when :add_current_to_string
result << ch
when :finish_current_string
puts. result.join
end
end


```

In this example the result of each transition is both a new state and action.

### The Observer pattern

In the observable pattern we have a source of events, called the observable and a list of clients, the observers, who are listening for those events.

An observer registers its interest with the observable, typically by passing a reference to a function to be called.

[Example](./examples/event/observer.rb)

### Publish/Subscribe

Publish/Subscribe (pubsub) generalizes the observer pattern , at the time solving the problems of coupling and performance.
In the pubsub model, we have publishers and subscribers.
They are connected via channels. The channels are implemented in seprate body of code: sometimes a library, sometimes a process, and sometimes a
distributed infrastructure.

Communication between the publisher and subcriber is handled outise your code, and is potentially asynchronous.

The downside is that it can be hard to see what is going on in system that uses pubsub heavily.

Compared to the observer pattern, pubsub is a great example of reducing coupling by abstracting up through a shared interface (the channel)

### Reactive Programming, Streams, and Events

[Example](./examples/event/rx1/index.js)

#### Streaùs of events are asynchronous Collections

Event streams unify synchronous and asynchronous processing behind a common convenient API. This

### Events Are Ubiquitous

Events are everywhere. Some are obvious: a button click, a timer expiring.
Other are less so: someone logging in, a line in a file matching a pattern. But whatever their source, code that's crafted around events can be more responsive and better dcoupled than its more linear counterpart.

## Transforming

All prgrams transform data, converting an input into an output. And yet when we think about design, we rarely think about creating transformations.
Instead we worry about classes and modules, data structures and algorithms, languages and frameworks.

IF we ask a unix programmer to write us a program that lists the five longest files in a directory, where longest means "having the largest number of lines."
It will probaly do something like this:

```sh
    find . -type f | xargs wc -l | sort -n | tail -5
```

![The find pipeline as a series of transformations](./find_pipeline.svg)

Our original requirement, "top 5 files in terms of lines" becomes a series of transformations:

directory name

- list of files
- list with line numbers
- sorted list
- highest five + total
- highest five

Like an industrial assembly line: feed raw data in one end and the finished product (information) comes out the other.

Code should be through the same way.

> Programming Is About Code, But Programs Are About Data

Finding Transformations

TThe easiest way to find the transformations is to start with the requirement and determine its inputs and ouputs.

This approach is called top-down.

Example with a website for folks playing word games that finds all the the words that can be made from a set of letters.

Input: Set of letters , Output: List of three-letter words, four-letter words and so on:

3 => ivy,lin,nil,yin

Lvying is transformed to 4 => inly,liny,viny
5 => vinyl

The trick for the application is to have a dictionary which groups words by a signature, chosen so that all words containing the same letters will have the same signature.

| Step    | Transformation                                                  | Sample data                                                           |
| ------- | --------------------------------------------------------------- | --------------------------------------------------------------------- |
| Step O: | Initial input                                                   | ylvin                                                                 |
| Step 1: | All combinations of the tyhree or more letters                  | vin,viy,vil,vny,vnl,iny,inl,iyl,nyl,viny,vinl,viyl,vnyl,inyl,vinyl    |
| Step 2: | Signatures of the combinations                                  | inv,ivy,ilv,nvy,lnv,lvy,iny,iln,ily,lny,mvy,ilnv,ilvy,lnvy,ilny,ilnvy |
| Step 3: | List of all dictionnary words which march any of the signatures | ivy,yin,nil,lin,viny,liny,inly,vinyl                                  |
| Step 4: | Words grouped by length                                         | 3 => ivy, lin, nil, yin 4 => inly, liny, viny 5 => vinyl              |

Transformations All the Way Down

Every step in the first table can be breaken down futher

| Step 1.0  | Transformation                          | Sample data                                                                            |
| --------- | --------------------------------------- | -------------------------------------------------------------------------------------- |
| Step O:   | Initial input                           | vinyl                                                                                  |
| Step 1.1: | Convert to characters                   | v,i,n,y,l                                                                              |
| Step 1.2: | Get all subsets                         | [],[v],[i] ... [v,i],[v,n],[v,y]...[v,i,n],[v,i,y] ... [v,n,y,l],[i,n,y,l],[v,i,n,y,l] |
| Step 1.3: | Only those longer than three characters | [v,i,n],[v,i,y],...[i,n,y,l],[v,i,n,y,l]                                               |
| Step 1.4: | Words grouped by length                 | 3 => ivy, lin, nil, yin 4 => inly, liny, viny 5 => vinyl                               |

With that we can now implement each transformations

[Anagrams](./examples/transform/anagrams.ts)

### Transformations Transform Programming

Thinking of code as a series of transformations can be liberating approach to programming.

// TODO: Exercise 21
// TODO: Exercise 22
// TODO: Exercise 23

## Inheritance Tax

### Problems Using Inheritance to Share Code

Inheritance is coupling. The child class is coupled to the parent and the code that use the child is coupled to all ancestors.

// TODO: Exercise in javascript

```ruby

class Vehicle

def initialize
@speed = 0
end

def stop
@speed = 0
end

def move_at(speed)
@speed = speed
end

class Car < Vehicle

def info
"I'm car driving at #{@speed}"
end

end

# top-level code

my_ride = Car.new
my_ride.move_at(30)

```

In this example its the vehicle method of move_at that is called.
Now if the API of vehicle change and move_at became set_velocity and the instance variable @speed becomes @velocity.
The child class will break.

An API change is expected to break clients of Vehicle class. But the top-level is not: as far as it is concerned it is using a Car.
What hte Car class does in terms of implementation is not the concern of the top-level code, but it still breaks.

Similarly the name of an instance variable is purely an internal implementation detail, but when Vehicle changes it also (silently) breaks Car.
So much coupling.

### Problems using inheritance to Build Types

inhereritance shouldn't be a way of defining new types.
Their favorite design diagram shows class hierarchies.

These hierachies soon grow into wall-covering monstrosities, layer-upon-layer added in order to express the smallest nuance of
differentiation between classes.

This added complexity can make the application more brittle, as changes can ripple up and down many layers.

Don't Pay Inheritane Tax

### The Alternative Are Better

Three techniques that mean you should never need to use inheritance again:

1. Interfaces and Protocols
2. Delegation
3. Mixins and traits

### Interfaces and Protocols

Most OO languages allow you to specify that class implements one or more sets ofe behaviors.

Example with Car: Car class implements Drivable and Locatable behavior.

What makes interfaces and protocols so powerful is that we can use them as types.

Interfaces and protocols give us polymorphism without inheritance.

### Delegation

Preferer delegation over inheritance:

```ruby

// BAD
class Account < PersistenceBaseClass
end

// GOOD
class Account
def initialize(...)
@repo = Persister.for(self)
end

def save
@repo.save()
end
end

```

Now that we're no longer constrained by the API of the framework we're using, we're free to create the API we need.

Delegate to Services Has-A Trumps Is-A

```ruby

class Account
# nothing but account stuff
end

class AccountRecord
# wraps an account with the ability
# to be fetched and stored
end

```

Now the code is decoupled but at the cost of having to write more code, and typically some of it will be boilterplate.
It's likely that all our record classes will need a find method. That what mixins and traits do for us.

Mixins, Traits, Categories,Protocols extensions, ...

Mixin give the ability to extend classes and object with new functionality without using inheritance.

Example mixin for common persistence methods:

```ruby

mixin CommonFinders {
    def find(id){...}
    def findAll() {...}
end
}

```

As an example, let's go back to our AccountRecord example. As we letf it, an AccountRecord needed to know about both accounts and about our persistence framework. It also needed to deleagte all the methods in the persistence layer that it wanted to expose to the outside world.

Mixins give us an alterantive. Write the standard method in the mixin and add them into AccountRecord

```ruby

mixin CommonFinders {
    def find(id) {...}
    def findAll() { ... }
end

}

class AccountRecord extends BasicRecord with CommonFinders
class OrderRecord extends BasicRecord with CommonFinders

```

Example with validation:

```ruby

class AccounForCustomer extends Account with AccountValidations,AccountCustomerValidations

class AccountForAdmin extends Account with AccountValidations,AccountAdminValidations

```

Use mixins to Share Functionality

Inheritance Is Rarely the Answer

### Configuration

Values that may change after the application has gone live, or value specifique to customers should be keep outside of the app.

Parameterize Your App Using External Configuration.

### Configuration As Service

Configuration can also be stored behind a service API. This has a number of benefits:

- Multiple applications can share configuration information, with authentification and access control limiting what each can see.
- Configuration changes can be made globally.
- The confgiuration data can be maintained via a specialized UI.

### Don't Write Dodo-Code

### Don't Overdo It

Don't Overdo it and Don't push decisions to configuration out of laziness.

## Concurrency

Concurrency is when the execution of two or more pieces of code act as if they run at the same time.
Parallelism is when they do run at the same time.

To have concurrency, you need to run code in environment that can switch execution between different parts of your code when it is running. This is often implemented using thins such as fibers, threads, processes.
