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

The biggest difficulty with concurrency is shared state. This doesn't just mean global variables: any time two or more chunks of code hold references to the same piece of mutable data, you have shared state.

There is workarounds for this but ultimately they're all error prone.

### Breaking Temporal Coupling

There are two aspects of time that are important to us: concurrency and ordering.
When people first sit down to design an architecture or write a program, things lend to be linear.
That's the way most people think do this and then always do that.
But thinking this way leads to temporal coupling: coupling in time.

This approach is not very flexible , and not very realistic.

We nned to allow for concurrency and to think about decoupling any time or order dependencies. In doing so
we gain flexibility and reduce any time based dependencies in many area of development:
workflow analysis, architecture, design , and deployment.

### Looking for Concurrency

#### Analyse workflow to Improve Concurrency Using Activity Diagram

An activity diagram consists of a set of actions drawn as rounded boxes. TheThe arrow leaving an action leads to either
another action (which can start once the first action completes) or a thick line called a synchronization bar.
When actions leading to a synchronization bar is finis, you can proceed along any arroww leaving the bar.
An action without arrow can be started any time.

Activity Diagrams can be used to identifying process that could be perform in parallel but aren't.

Example with robotic pina colada marker:

1. open blender
2. open pina colada mix
3. put mix in blender
4. measure 1/2 cup white rum
5. Pour in rum
6. Add 2 cups of ice

7. Close blender
8. Liquefy for 1 minute
9. Open blender
10. Get glasses
11. Get pink umbrellas
12. Serve

Even though these actions are describe serially, many of them could be performed in parallel.

![alt](./activity.svg)

Activity diagram show the potential areas of concurrency
When can find activities that take time, but not time in
our code.Querying a dataabase, accesing an external service, waiting for user input.

### Opportunties for parallelism

Remember the distinction: concurrency is a software mechanism, and paralleslims is a hardware concern.

If we have multiple processors either locally or remotely, then if we can split work out among them we can reduce the overall time things take.

The ideal things to split this way are pieces of work that are relatively indepedent, where each can proceed without waiting for anyhting from the others. A common pattern is to take a large piece of work, split it into independant chunks, process each in parallet , then combine the result.

## Shared State Is Incorrect State

Example:

You're in your favorite diner. YOu finish your main course, and ask your server if there's any apple pie left.

He lloks over his shoulder, sees one piece in the display case and says yes. You order it and sight contentedly.

Meanwhile, on the other side of the restaurant, another customer asks their server the same question. She also looks, confirms there's a piece, and that customer orders.

One of the customers is going to be disappointed.

### Nonatomic Updates

![Nonatomic Updates](./noatomic_update.svg)

Waiter 1 gets the current pie count, and finds that it is one. He promises the pie to the customer.
But at that point waiter 2 runs and she alos sees the pie count is one and make the same promise to her customer.
The problem here is not hat two processes can write to the same memory. The problem is that neighter process can guarantee that its view of that memory is consistent.

### Semaphores and Other Forms of Mutual Exclusion

A semaphore is simply a thing that only one person
can own at a time.
You can create a semaphore and the use it to control access to some other resource.

example with waiter:

```ruby

case_semaphore.lock()

if display_case.pie_count > 0

promise_pie_to_customer()
display_case.take_pie()
give_pie_to_customer()

end

case_semaphore.unlock()

```

### Make the resource Transactional

The current design is poor because it delegates responsibility for protecting acces to the pie case to the people who use it.

To do this, we have to change the API so that waiters can check the count and alose take a slice in a single call:

```ruby

slice = display_case.get_pie_if_available()
if slice
give_pie_to_customer()
end

```

To make this work, we need to write a method that runs as port of the display cas itself:

```ruby
def get_pie_if_available()
@case_semaphore.lock()
try {
    if @slices.size > 0
    update_sales_data(:pie)
    return @slices.shift
    else
    false
    end
    end
} ensure{
    @case_semaphore.unlock()
 }
```

#### Random Failures Are Often Concurrency Issues

## Actors and processes

Actors and processes offer ways of implementing concurrency without the burden of synchronizing access to shared memory.

Actor
: An actor is an independent virtual processor with its own local ( and private) state.
Each actor as a mailbox.
When a message appears in te mailbox and the actor is idle, it kicks into life and processes the message. When it finishes processing, it processes another message in the mailbox, or , if the mailbox is empty, it goes back to sleep.

Process
: A process is typically a more general-purpose virtual processor, often implemented by the operating system to facilitate concurrency. Processes can be constrained (by convention) to behave like actors, and that's the type of process we mean here.

### Actor can only be concurrent

There are thing that are not in the definition of actors:

- There's no single thing that's in control. Nothing schhedules what happens next, or orchestrates the transfer of information from the raw data to the final output

- State in the system is held in messages and in the local state of each actor.Messages cannot be examined except by being read by their recipient, and local state is inaccesible outised the actor.
- All messages are one way there's no concept of replying. If you want an actor to return response, you include your own mailbox address in the message you send it, and it will (eventually) send the response as just another message to that mailbox.

- An actor processes each message to completion, and only processes one message at a time.

As a result, actors execute concurrently, asynchronously and share nothing. If you had enough physical processors you could run an actor on each. If you have a single processor, then some runtime can handle the switching of context betweenb them. Either way, the code running in the actors is the same

> Use Actors for Concurrency Without Shared State

### A Simple Actor

Let's implement our diner using actors. In this case, we'll have three (the customer, the waiter, and the pie case).

the overall message flow will look like this: this

- We ( as some kind of external, God-like being) tell the customer that they are hungry
- second
- In response, they'll ask the waiter for pie
- The waiter will ask the pie case to get some pie to the customer
- If the pie case has a slice available, it will send it to the customer, and also notify the waiter to add it to the bill
- If there is no pie, the case telle the waiter, and te waiter apologizes to the customer

The customer can receive three messages:

- You're hungry ( send by the external context)
- There's pie on the table ( sent by pie case )
- Sorry, there's no pie ( send by the waiter )

[Actor/Processus](./examples/actors/index.ts)

### No Explicit Concurrency

In the actor model, there's no need to write any code to handle concurrency as there is no shared state. There's also no need to code in explicit end-to-end "do this, do that" logic, as the actors work it out for themselves based on the messages they receive.

There's also no mention of the underlying architecture. This set of components work equally well on a single processor, on multiple cores, or multiple networked machines.

### Erlang Sets the Stage

The erlang language and runtime are great examples of an actor implementation. Erlang calls actors processes.

Erlang processes are lightweight and they communicate by sending messages.
Each is isolated from the others, so there is no sharing of state.
In addition, the Erlang runtime implements a supervision system which manages the lifetimees of set of processes in case of failure.

### Blackboards

Consider how detectives might use a blackboard to coordinate and solve a murder investigation.
The chief inspector starts off by setting up a large blackboard in the conference room. On it , she writes a single question:

H.Dumpty (Male,Egg): Accident ? Murder ?

> Use blackboards to Coordinate workflow

Each detective make contributions to this potentail murder mystery by adding facts, statetements, forensic evidence that might arise, and so on

Some key features of the blackboard approach are :

- None of the detective needs to know of the existence of any other detective they watch the board for new information, and add their findings
- The detectives may be trained in different disciplines, may have different levels of education and expertise, and may not even work in the same precinct. They share a desire to solve the case, but that's all.
- Different etectives may come and go during the course of the process, and may work different shifts.
- There are no restrictions on what may be placed on the blackboard. It may be pictures, sentences, physical evidence, and so on.

This is a form of laissez faire concurrency. The detecctives are independent processes, agents, actors and so on. Some store facts on the blackboard. Other take facts off the board, maybe combining or processing them, and add more information to the board.

Computer base blackboard systems were originally used in artificial intelligence applications.
where the problems to solved were large and complex speech recognition, knowledge based reasoning systems, and so on.

### A blackboard in Action

Suppose we are writing a program to accept and process mortgage or loan applications.
Te laws that govern this area are odiously complex, with federal, state, and local governments all having their say.

The lender must prove they have disclosed certain things, and must ask for certain information - but must not ask certain other questions, and so on ,and so on. Some

There is also the following problems to contend with:

- Responses can arrive in any order. For instance, queries for a credit check or title search may take a substantial amount of time, while items such as name and address may be available immediately.
- Data gathering may be done by different people, distributed across different offices, in different time zones
- Some data gathering may be done automatically by other systems. This data may arrive asynchronously as well.
- Nonetheless, certain data may still be dependent on other data. For instance , you may not be able to start the title search for a car until you get proof of ownership or insurance.
- The arrival of new data may raise new questions and policies. Suppose the credit check come back with a less glowing report; now you need these five extra forms and perhaps a blood sample.

You can try handle every possible combination and circumstance using a workflow system. Here
Many such systems exist, but they can be complex and programmer intensive.
As regulation change, thew workflow muste be reorganized: people may have to change their procedures and hard-wired code may have to be rewritten.

A blackboard, in combination with a rulesengine that encapsulates the legal requirements, is an elegant solution to the difficulties found here. Order of data arrival is irrelevant: when a fact is osted it can trigger the appropriate rules.

Feedback is easily handled as well: the output of any set of rules can post to the blackboard and cause the triggering of more applicable rules.

> Use blackboard to Coordinate Workflow

### Messaging systems can be like Blackboards

Many applications (micro service) are constructed using small, decoupled service, all communicating via some form of messaging sytem. These messasing systems (such as Kafka and NATS)
do far more thant simply send data from A to B. In particular they offer persistence (in form of an evant log) and the ability to retrieve messages though a form of pattern matching. This means you can use them both as a blackboard system and or as platform on which you can run a bunch of actors.

### But It's Not That Simple

The actor and/or blackboard and/or microservice approach to architecture removes a whole class of potential concurrency problems from your applications. But that benefit comes at a cost. These approaches are harder to reason about, because a lot of the action is indirect. You'ill find it helps to keep a central repository of message formats and/or APIs, particularly if the repository can generate the code and documentation for you.You'll also need good tooling to be able to trace messages and facts as they progress through the system. You

Finally, these kinds of system can be more troublesome to deploy and manage, as there are more moving parts. To some extend this offset by the fact that the system is more granular, and can be updated by replacing individual actors, and not the whole system.

## While your are coding

Many people thinks that when a project is a coding phase, the work is mostly mechanical, transcribing design into executable statements.

That attitute is a big reason that software projects fail, and many sytems end up ugly, inefficient, poorly structured, unmaintainable, or just plain wrong.

Coding is not mechanical. If it were , all the CASE tools that people pinned their hopes on way back in the early 1980s would have replaced programmers long ago.

There are decisions to be made every minute , decisions that require careful thought and judgment if the resulting program is to enjoy a long, accurate, productive life.

Not all decisions are even conscious. You can harness your instincts and nonconscious thoughts when you Listen to Your Lizard Brain.

Listening to your instincts doesn't mean you can fly on autopilot. Developers who don't actively think about their code are programming by coincidence. The code might work, but there's no particular reason why.

While most of code are fast, sometime we develop algorithms that have the potential to bog down the fastest processors. Algorithms Speed is a ways to estimate the speed of code.

Testing is not about finding bugs, it's about getting feedback on your code: aspects of design, the API, coupling, and so on. The

That means that the major benefits of testing happend when you think about and write them.

It's critical that code is readable and easy to reason about.

One of the hardest things in software development is Naming Things.

### Fear of the Blank Page

Everyone fears the empty screen, the lonely blinking cursor surrounded by a whole bunch of nothing. Starting a new project (or even a new module in an existing project) can be an unnerving experience.

Many of use would prefer to put off making the inital commitment of starting.

We think that there are two problems that cause this and that both have the same solution.

One problem is that your lizard brain is trying to tell you something there's some kind of doubt lurking juste below the surface of perception. And that's important.

As a developer, you've been trying things and seeing which worked and which didn't. You've been accumulating experience and wisdom. When you feel a nanning doubt, or experience some reluctance when faced with a task, it miht be that experience trying to speak to you. Heed it. you may not be able to put your finger on exactly what's wrong, but give it item and your doubts will probably crystallize into something you can address.

Let your instincs contribute to your performance.

The other problem is a little more prosaic: you might simply be afraid that you'll make a mistake.

And that's a reasonable fear. We developers put a lot of ourselves into our code; we can take errors in that code as reflections on our competence. Perhaps there's an element of imposter syndrome too; we may think that this project is beyond us. We can't see our way through to the end; we'll get so far and then be forced to admit that we're lost.

### Fighting Yourself

Sometimes code just flies from your brain into the editor: ideas become bits with seemingly no effort.

Orther days, coding feels like walking uphill in mud. Taking each step requires tremendous effort, and every three steps you slide back two.

But, being a professional, you soldier on, taking step after muddy step: you have a job to do.
Unfortunaly, that's probaly the exact opposite of what you should do.

Your code is trying to tell you something. It's saying that this is harder that it should be.
Maybe the structure or design is wrong, maybe you're solving the wrong problem, or maybe you're just creating an ant farm's worth of bugs. Whatever the reason, your lizard brain is sensing feedback from the code, and it's desperately trying to get you to listen.

### How to Talk Lizard

We talk a lot about listening to your instincts, to your nonconsicous, lizard brain. The techniques are always the same.

> Listen To Your Inner Lizard

First, stop what you're doing. Give yourself a little time and space to let your brain organize itselft. Stop thinking about the code, and do something that is fairly mindless for a while away from a keyboard. Take a walk, chat with someone. Maybe sleep on it. let the ideas percolate up through the layers of your brain on their own: you can't force it. Eventually they may buble up to the conscious level, and you have one of those a ha! moments.

If that's not working, try externalizing the issue. Make doodles about the code you're writing, or explain it to a coworker (preferably one who isn't a programmer), or to your rubber duck. Expose different parts of your brain to the issue, and see if any of them have a better handle on the thing that's troubling you. We've lost track of the number of conversaiton we've had where one of us was explaining a problem to the other and suddenly "Oh! Of course!" and broke off to fix it.

But maybe you've tried these things, and you're still stuck. It's time for actions. We need to tell your brain that what you're about to do doesn't matter. And we do that by prototyping.

### It's Playtime!

Tell yourself you need to prototype something if you're facing a blaknk screen, then look for some aspect of the project that you want to explore. Maybe you're using a new framework, and want to see how it does data binding. Or maybe it's a new algorithm, and you want to explore how it works on edge cases. Or maybe you want to try a couple of different styles of user interaction.

If you're working on existing code and it's pushing back, then stash it away somewhere and prototype up something somilar instead.

Do the following.

1. Write "I'm prototyping" on a sticky note and stick it on the side of your screen.
2. Remind yourself that prototypes are meant to fail. And remind yourself that prototypes get thrown away, even if they don't fail. There is no downside to doing this.
3. In your empty editor buffer, create a comment describing in one sentence what you want to learn or do.
4. Start coding

If you start to have doubts, look at the sticky note.
If, in the middle of coding, that nagging doubt suddenly crystallizes into a solid concern, then address it.

If you get to the end of the experiment and you still feel uneasy, start again with the walk and the talk and the talk and the time off.

But, in our experecience, at some point during the first prototype you will be surprised to find yourself humming along with your music enjoying the feeling of creating code. The nervousness will have evaporeted, replaced by a feeling of urgency, let's get this done!

At this stage, you know what to do. Delete all the prototype code, throw away the sticky note and fill that empty editor buffer with bright shiny new code.

### Not Just Your Code

A large part of our job is dealing with existing code, often written by other
people. Those people will have different instincts to you, and so the decisions they made will be different. Not necessarily worse; just different.

You can read their code mechanically, slogging through it making notes on stuff that seems important. It's a chore, but it works Or you can try and experiment. When you spot things done in a way that seems strange, jot it down. Continue doing this, and look for patterns. If you can see what drove them to write code that way, you may find that the job of understanding it becomes a lot easier, You'll be able consciously to apply the patterns that they applied tacitly.

And you might just learn something new along the way.

### Not Just Code

Learning to listen to your gut when coding is an import skill to foster. But it applies to the biggger picture are well. Sometimes a design just feels wrong, or some requirement makes you feel uneasy. Stop and analyze the feelings. If you're in a supportive environment, express them out loud. Explore them. The chances are that there's something lurking in that dark doorway. Listen to your instincts and avoid the problem before it jumps out of you.

### Programming By Coincidence

Suppose Fred is given a programming assignment. Fred types in some code, tries it, and seems to work. fred types in some more code, tries it, and it still seems to work. After several weeks of coding this way the program suddenly stop working, and after hours of trying to fix it, he still doesn't know why. Fred may well spend a significant amount of time chasing this piece of code around without ever being able to fix it. No matter what he does, it just doesn't ever seem to work right. Fred doesn't know why the code is failing because he didn't know why it worked in the first place. It seemed to work, given the limited "testing" that Fred did, but that was just a coincidence. Buoyed by false confidence, Fred changed ahead into oblivion. Now, most intelligent people may know someone like Fred, but we know better. We don't rely on coincidences do we ?

### Accidents of Implementations

Accidents of implementation are things that happen simply because that's the way the code is currently written? you end up relying on undocumented error or boundary conditions.

Suppose you call a routine with bad data. The routine responds in a particular way, and you code based on that response. But the author didn't intend for the routine to work that way it was never even considered.
When the routine gets "fixed" your code may break. In the most extreme case, the routine you called may not even be designed to do what you want, but it seems to work okay. Calling things in the wrong order, or in the wrong context, is a related problem.

Here it looks like Fred is desperately trying to get something out on the screen using some particular GUI rendering framework:

paint();
invalidate();
validate();
revalidate();
repaint();
paitImmediately();

But these routines were never designed to be called this way;
although they seem to work, that's really just a coincidence.

To add insult to injury, when the scene finally does get drawn,
Fred won't try to go back and take out the spurious calls. "It works now, better leave well enough alone..."

It's easy to be fooled by this line of thought. Why should you take the risk of messing with something that's working ? Well, we can think of several reasons:

- It may not really be working, it might just look like it is
- The noundary condition you rely on may be just an accident. In different circumstances (a diferent screen resolution, more CPU cores), it might behave differently.
- Undocumented behavior may change with the next release of the library.
- Additional and unnecessary calls make your code slower.
- Additionla calls increase the risk of introducing new bugs of their own.

For code you write that others will call, the basic principles of good modularization and of hiding implementation behind small, well-documented interfaces can all help. A well specified contract can help elimate misunderstandings.

For routines you call, rely only on documented behavior. If you can't , for whatever reason, then document your assumption well.

### Close Enough Isn't

We once worked on a large project that reported on data fed from a very large number of hardware data collection units out in the field. These units spanned states and time zones, and for various logistical and historical reasons, each unit was set to local time.As a result of conflicting time zone interpreations and inconsistencies in Daylight Saving Time policies, results were almost always wrong, but only off by one. The developers on the project had gotten ionto the habit of just adding one or subtracting one to get the correct answer, reasoning that it was only off by one in this one situation. And then the next function would see the value as off by the one the other way, and change it back.

But the fact that it was "only" off by one some of the time was a coincidence, masking a deeper and more fundamental flaw.
Without a proper model of time handling, the entire large code base had devolved over time to an untenable mass of +1 and -1 statements. Ultimately, none of it was correct and the project was scrapped.

### Phantom Patterns

Human beings are designed to see patterns and causes, even when it's just a coincidence. For example, Russian leaders always alternate between being bald and hairy: a bald (or obviously balding) state leader of Russia has succeded a non-bald ("hairy") one, and vice versa, for nearly 200 years.

But while you wouldn't writre code that depended on the next Russisan leader being bald or hairy, in some domains we think that way all the time.
Gamblers image patterns in lottery numbers, dice game, or roulette, when in fact these are statistically independent events. In finance, stock and bond trading are similarly rife with coincidence instead of actual, discernible patterns.

A log file that shows an intermittend error every 1,000 request may be diffucult-to-diagnose race condition, or may be a plain old bug. Tests that seem to pass on machine but not on the server might indicate a difference between the two environments, or maybe it's just a coincidence.

Don't assume it, prove it.

### Accidents of Context

You can have "accidents of context" as well. Suppose you are writing a utility module, juste because you currently coding for a GUI environment does the module have to rely on a GUI being present ? Are you relying on English-speaking users ? Literate users ? Wat else are you relying on that isn't guaranteed ?

Are you relying on the current directory being writable ? On certain environment variables or configuration files being present ? On the timeon the server being accurate -- within what tolerance ? Are you relying on network availability and speed ?

When you copied code from the first answer you found on the net, are you sure your context is the same ? Or are you building "cargo cult" code, merely imitaing fomr without content ?

Finding an answer that happends to fit is not the same as the right answer.

> Don't Program by Coincidence

### Implicit Assumptions

Coincidences can mislaed at all levels from generating requirements through to testing.

Testing is particularly fraught with false causalities and coinccidental outcomes. It's easy to assume that X causes Y but assuming is not enough you need to prove it.

At all levels, people operate with many assumptions in mind but these assumptions are rarely documented and are often in conflict between different developers. Assumptions that aren't based on well-established facts are the bane of all projects.

### How to Program Deliberately

We want to spend less time churning out code, catch and fix errors as early in the development cycle as possible and create fewer erros to begin with. It helps if we can program deliberately:

- Always be aware of waht you are doing.
- Can you explain the code, in detail, to a more junior programmer ? if not, perhaps you are relying on coincidences.
- Don't code in the dark. Build an application you don't fully graps, or use technology you don't understant, and you'll likely be bitten by coincidences. If you're not sure why it works, you won't know why it fails.
- Proceed from a plan, whether that plan is in your head, on the back of a cocktail napkin, or on a whiteboard.
- Rely only on reliable things. Don't depend on assumptions. If you can't tell if something is reliable, assume the worst.
- Document your assumptions. Design by contract, can help clarify your assumptions in your own mind, as well as help communicate them to others.
- Don't just test your code, but test your assumptions as well. Don't guess; actually try it. Write an assertion to test your asumptions. If your assertion is right, you have improved the documentation in your code. If you discover your assumptions is wrong, then count yourself lucky.
- Prioritize your effort. Spend time on the important aspects; more than likely, these are the hard parts. If you don't have a fundamentals or infrastructure correct, brilliant bells and whistles will be irrelevant.
- Don't be a slave to history.Don't let existing code dictate future code. All code can be replaced if it is no longer appropriate.Even within one program, don't let what you've already done constrain what you do next be ready to refactor. This decision may impact the project schedule. The assumption is that impact will be less than the cost of not making change.

So next time something seems to work, but you don't know why make sur it isn't just a coincidence.

### Algorithm Speed

Estimating the resources that algorithms use -- time,processor,memory, and so on.

This kind of estimating is often crucial.

#### What Do We Mean By Estimating Algorithms ?

Monstr nontrivial algorigthms handle some kind of variable input -- sorting n strings, inverting a m\*n matrix, or decrypting a message with an n-bit key.
Normally, thesize of this input will affect the algorithm: the larger the input, the longer the running time or the more memory used.

If the relationship where always linear ( so that the time increased in direct proportion to the value of n), this section wouldn't be important. However, most significant algorithms are not linear. The good news is that many are sublinear. A binary search, for example, doesn't need to llok at every candidate when finding a match. the bad news is that other algorithms are considerably worse than linear; runtimes or memory requirements increase far faster than n.
An algorithm that takes a minute to process ten items may take a lifetime to process 100.

We find that whenever we write anything containing loops or recursive calls, we subconsciously check the runtime and memory requirements. this is rarely a formal process, but rather a quick confirmation that what we're doing is sensible in the circumstances. However, we sometimes do find ourselves perfoming a more detailed analysis. That's when Big-O notaiton comes in handy.

#### Big-O Notation

The Big-O notation, written O(), is a mathematical way of dealing with approximations. When we write that a particular sort routine sorts n records in O(n²) time, we are simply saying that te worst-case time taken will vary as time square of n. Double the number of records, and time will increase roughly fourfold.Think of the O as meaning on the order of.

The O() notation puts an upper bound on the value of the thing we're measuring(time, memory, and so on). If we say a function takes O(n2) time, then we know that the upper bound of the time it takes will not grow faster than n². Sometimes we come up with fairly complex O() functions, but because the hightest-order term will dominate the value as n increases, the convention is to remove all low-order terms, and not to bother showing any constant multiplying factors:

O(n²/2+3n) is the same as O(n²/2) is the same as O(n²)

This is actually a feature of the O() notation one O(n²) algorithm may be 1000 times faster than another O(n²) algorithm, but you won't know from the notation. Big-O is never going to give you actual numbers for time or memory or whatever: it simply tells how these values will change as the input change.

For example, suppose you've got a routine that takes one second to process 100 records. How long will it take to process 1000 ? if your code is O(1) then it will still take one second. If it's O(lg n), then you'll probably be waiting about three seconds. O(n) will show example, it is often useful to be able to model memory consumption.

O(1) Constant (access element in array, simple statements)
O(lg n) logarithmic (binary search). The base of the logarithm doesn't matter, so this is equivalent O(log n)
O(n) Linear (sequential search)
O(n lg n) Wore than linear, but not much worse. (Average runime of quicksort, heapsort)
O(n²) Square law (selection and insertion sorts)
O(n^3) Cubic (multiplication of two nxn matrices)
O(c^n) Exponetial (traveling salesman problem, set partitioning)

![Various Algorithms Time](./various%20algorithms.png)

## Runtimes of various algorithms

### Common Sense Estimation

You can estimate the order of many basic algorithms using common sense. For

#### Simple loops

If a simple loop runs from 1 to n, then the algorithm is likely to be o(n) time increases linearly with n.
Examples include exhaustive searches, finding the maximun value in an array, and generating checksums.

#### Nested Loops

If you nest a loop inside another, then your algorithms becomes O(m x n), where m and n are the two loops'limits.
This commonly occurs in simple sorting alhorithms, such as bubbled sort, where the outer loop scans each element in the array in turn, and the inner loop works out where to place that element in the sorted result.
Such sorting algorithms tend to be O(n²)

#### Binary chop

If your alhorithm halves the set of things it considers each time aroud the loop, then it is likely to be logarithmic, O(lg n). A binary search of a sorted list, traversing a binary tree, and finding the first set bit in a machine word can all be O(lg n)

#### Divide and conquer

Algorithms that partition their input work on the two halves independently, and then combine the result can be O(nlgn). The classic example is quicksort, which works by partitioning the data into two halves and recursively sorting each. Althought technically O(n²), because its behavior degrades when it is fed sorted input, the average runtime of quicksort is O(nlgn)

#### Combinatoric

Whenever algorithms start looking at the permutations of things, their running times may get out of hand. This is because permutations involve factorial (there are 5!= 5*4*3*2*1 = 120 permutations of the digits from 1 to 5). Time a combinatoric algorithm for five elements: it will take six times longer to run it for six and 42 times longer for seven.

Examples include algorithms for many of the acknowledged hard problems, the traveling salesman problem, optimally packing things into a container, partitioning a set of numbers so that each set has the same total, and so on.

Often, heuristics are used to reduce the running times of these types of algorithms in particular domains.

#### Algorithm Speed in Practice

Whenever you find yourself writing a simple loop, you know that yu have a O(n) algorithm. If that loop contains an inner loop, then you're looking at O(m x n). You should be asking yourself how large these values can get. If the numbers depend on external factors then you might want to stop and consider the effect that large values may have on your running time or memory consumption.

> Estimate the Order of Your Algorithms

There are some approaches you can take to address potential problems.
If you have an algorithm that is O(n2), try to find a divide-and-conquer approach that will take you down to O( n lg n).

After all this estimating, the only timing that counts is the speed of your code, running in the production environment, with real data.

> Test Your Estimates

If it's tricky getting accurate timings, use code profileers to count the number of times the different steps in your algorithm get executed, and plot these figures agains the size of the input.

#### Best Isn't Always Best

Also be wary of premature optimization. It's always a good idea to make sure an algorithm really is a bottleneck before investing your precious time trying to improve it.

### Refactoring

As a program evolves, it will become necessary to rethink earlier decisions
and rework portions of the code. This process is perfectly natural.

Code needs to evolve; it's not a static thing.

Unfortunately, the most common metaphor for software development is building construction.
But using construction as the guiding metaphor implies the following steps:

1. An architect draws up blueprints.

2. Contractors dig the foundation, build the superstructure, wire and plumb, and apply finishing touches.
3. The tenants move in and live happily ever after, calling building maintenance to fix problems.

Software doesn't work that way. Rather than construction, software is more like gardening , it is more organic than concrete.

You plant things in a garden according to an initial plan and conditions.

Some thrive, others are destined to end up as compost. You may move plantings relative to each other to take advantage of the interplay of light and shadow, wind and rain. Overgrown plants get split or pruned, and colors that clash may get moved to more aesthetically pleasing locations.

You pull weeds and you fertilize plantings that are in need of some extra help. You constantly monitor the health of the garden, and make adjustments (to the soil, the plants, the layout) as needed.

Business people are comfortable with metaphor of building construction: it is more scientific than gardening, it's repeatable, there's a rigid reporting hierarchy for management, and so on. But we're not building skyscrapers , we aren't constrained by the boundaries of physics and the real world.

The gardening metaphor is much closer to the realities of software development. Perhaps a certain routine has grown too large, or is trying to accomplish too much. It needs to be split into two. Things that don't work out as planned need to be weeded or pruned.

Rewriting, reworking, and re architecting code is collectively know as restructuring. But there's a subset of that activity that has become practiced as refactoring.

> Refactoring is disciplined technique for restructuring an existing body of code, altering its internal structure without changing its external behavior. It

The critical parts of this definition are that:

1. The activity is disciplined not a free-for-all
2. External behavior does not change; this is not the time to add features

Refactoring is not intended to be a special, high-ceremony, once-in-a-while activity, like plowing
under the whole garden in order to replant. Instead, reactoring is a day-to-day activity, taking low-risk
small steps, more like weeding and raking. Instead of a free-for-all, wholesale rewrite of codebase, it's a targeted,
precision apporach to help keep the code easy to change.

In order to guarantee that the external behavior hasn't changed, you need good, automated unit testing that validates the behavior of the code.

### When Should You Refactor ?

You refactor when you've learned something; when you understand something better than you did last year, yesterday, or even just ten minutes ago.

Perhaps you've come across a stumbling block because the code doesn't quite fit anymore, or you notice two things that should really be merged, or anyhting else at all strikes you as being "wrong," don't hesitate to change it. There's no time like the present. Any number of things may cause code to qualify for refactoring:

Duplication
: You've discovered a violation of DRY principle

Nonorthogonal design
: You've discovered something that could be made more orthogonal.

Outdated knowledge
: Things change, requirements drift, and your knowledge of the probleme increases. Codde needs to keep up.

Usage
: As the system gets used by real people under real circumstances, you realize some features are now more important than previously thought, and "must have" features perhaps weren't

Performance
: You need to move functionality from one area of the system to another to improve performance.

The Tests Pass
: Yes. Seriously. We did say that reactoring should be a smal scale activity, backed up by good test. So when you've added a small amount of code, and that one extra test passes, you now have a great opportunity do dive in and tidy up what you just wrote.
Refactoring your code moving functionality around and updating earlier decisions -- is really an exercise in pain management. Let's face it, changing source code around can be pretty painful: it was working, maybe it's better to leave well enough alone. Many developers are reluctant to to in an re-open a piece of code just because it isn't quite right.

### Real-World Complications

So you go to your teammates or client and say, "This code works, but i need another week to completely refactor it."

We can't print their reply.

Time pressure if often used as an excuse for not refactoring. but this excuse just doesn't hold up:

Fail to refactor now, and there'll be a far greater time investment to fix the probelm down the road when there are more dependencies to reckon with. Will there be more time available then ? Nope.

You might want to explain this principle to others by using a medical analogy: think of code that needs refactoring as "a growth.". removing it requires invasive surgery. You can go in now, and take it out while it is still small. Or, you could wait while it grows and spreads but removing it then will be both more expensive and more dangerous.

Wait even longer and you may lose the patient entirely.

> Refactor Early, Refactor Often

Collateral damage in code can be just as deadly over time.
Refactoring, as with most things, is easier to do while the issues are small, as an ongoing activity while coding. Youi shouldn't need "a week to refactor" a piece of code -- that's a full-on rewrite.
If that level of disruption is necessary, then you might well not be able to do it immediately.
Instead, make sur that it gets placed on the schedule. Make sure that users of affected code know that it is scheduled to be rewritten and how this might affect them.

### How Do You Refactor ?

Refactoring started out in the Smalltalk community, and had just started to gain a wider audience when we wrote the first edition of this book, probably thanks to the first major book on refactoring (Refactoring: Improving the Design of Existing Code)

At its heart refactoring is redesign.Anything that you or others on your team designed can be redesigned in light of new facts, deeper understandings , changing requirements, and so on. But if you proceed to rip up vast quantities of code with wild abandon, you may find yourself in a worse position than when you started. Clearly, refactoring is an activity that needs to be undertaken slowly, deliberately, and carefully. Martin fowler offers the following simple tips on how to refactor without doing more harm than good.

1. Don't try to refactor and add functionality at the same time
2. Make sure you have good tests before you begin refactoring. Run the tests as often as possible. That way you will know quickly if your changes have broken anything
3. Take short, deliberate steps: move a field from one class to another, split a method, rename a variable.Refactoring often involves making many localized changes that result in a larger scale change. If you keep your small and test after each step,you will avoid prolonged debugging

Maintaining good regressions tests is the key to refactoring safely.If you have to go beyond refactoring and end up changing external behavior or interfaces, then it can help to deliberately break the build: old clients of this code should fail to compile. That way you'll know what needs updating. Next time you see a piece of code that isn't quite as it should be, fix it. Manage the pain: if it hurts now, but is going to hurt even more later, you might as well get it over with.

## Test to Code

The major benefits of of testing happen when you think about and write the tests, not when you run them.

> Testing Is Not About Finding Bugs

### Thinking About Tests

It's a monday morning and you settle in to start work on some new code. You have to write something that queries the database to return a list of people who watch more than 10 videos a week on your "world's funniest dishwashing videos" site.

You fire up your editor, and start by writing the function that performs the query:

```ruby

def return_avid_viewers() do
    #... hmmm ...
end

```

Stop! How do you know that what you're about to do is a good thing ?

The answer is that you can't know that. No one can. But thinking about tests can make it more likely. Here's how that works.

Start by imagining that you'd finished to writing the function and now had to test it. How would you do that ? Well, you'd want to use some test data, which probably means you want to work in a database you control. Now some frameworks can handle that for you, running test against a test database, but in our case taht means we should be passing the database instance into our function rather than using some global one, as that allows use to change it while testing:

```ruby

def return_avid_users(db) do

end

```

Then we have to think about how we'd populate that test data.
The requirement ask for a "list of people who watch more than 10 videos a week." So we llok at the database schema for fields that might help. we find two likely fields in a table of who-watched-what: opened_video and completed_video. To write our test data, we need to know which field to use. But we don't know what the requirement means, and our business contact is out.

Let's just cheat and pass in the name of the field (which will allow us to test what we have, and potentially change it later):

```ruby

def return_avid_users(db,qualifying_field_name) do

```

We started by thinking about our tests, and without writing a line of code, we've already made two discoveries and used them to change the API of our method.

### Tests Drive Coding

In the previous example, thinking about testing made us reduce coupling in our code (by passing in a database connection and increase flexibility. Thinking about writing a test for our methode made us look at it from the outside, as if we were a client of the code, and not its author.

> A Test Is the First User of Your Code

This is probably the biggest benefit offered by testing: testing is a vital feedback that guides your coding.

A function or methode that is tightly coupled to other code is hard to test, because you have yo set up all environment before you can even run your method.

So making your stuff testable also reduce coupling.

And before you can test something , you have to understand it. That sounds silly but in reality we've all launched into a piece of code based on nebulous understanding of what we had to do. We assure ourselves that we'll work it out as we go along.
